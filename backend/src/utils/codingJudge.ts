import { spawn } from "node:child_process";
import { ICodingQuestion } from "../models/Lesson";
import { ITestResult } from "../models/CodingSubmission";
import { ApiError } from "./ApiError";

const PER_TEST_TIMEOUT_MS = 2000;
const MAX_TOTAL_TIMEOUT_MS = 10000;
const MAX_CODE_LENGTH = 20000;
const MAX_OUTPUT_BYTES = 1024 * 1024;
const MAX_CONCURRENT_JUDGES = 2;
const MAX_QUEUED_JUDGES = 20;

/**
 * Security model. Student code is untrusted and `node:vm` is NOT a security boundary (a
 * submission can reach the host realm via `this.constructor.constructor`). So student code
 * never runs inside the API process. Each submission runs in a separate, short-lived Node
 * process that:
 *   - gets an empty environment (no JWT/DB/Cloudinary secrets to steal),
 *   - runs under Node's permission model (no filesystem, child processes, workers, native
 *     addons or `process.binding`),
 *   - cannot build functions from strings (`--disallow-code-generation-from-strings`),
 *   - has a small heap cap and a hard wall-clock SIGKILL (the vm timeout alone is bypassable
 *     with microtasks),
 *   - is never sent the expected outputs — it only returns what the code produced, and the
 *     pass/fail comparison happens here, so a sandbox escape cannot forge a "passed" verdict.
 * Residual risk: Node's permission model does not restrict outbound network access. For
 * production, also run the API (or a dedicated judge service) with egress blocked.
 */
const RUNNER_SOURCE = String.raw`
"use strict";
const vm = require("vm");
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => { raw += c; });
process.stdin.on("end", () => {
  const { code, functionName, tests, timeoutMs } = JSON.parse(raw);
  const results = [];
  for (const args of tests) {
    const context = vm.createContext(Object.create(null), {
      codeGeneration: { strings: false, wasm: false },
      microtaskMode: "afterEvaluate",
    });
    context.__args = JSON.parse(JSON.stringify(args));
    try {
      const script = new vm.Script(
        code + "\n;(typeof " + functionName + " === \"function\" ? " + functionName +
          "(...__args) : (() => { throw new Error(" + JSON.stringify(functionName + " is not defined") + ") })())"
      );
      const out = script.runInContext(context, { timeout: timeoutMs });
      let json;
      try { json = JSON.stringify(out); } catch { json = undefined; }
      results.push({ ok: true, isUndefined: out === undefined, json: json === undefined ? null : json });
    } catch (err) {
      let message = "Execution error";
      try { message = String((err && err.message) || err).slice(0, 500); } catch {}
      results.push({ ok: false, error: message });
    }
  }
  process.stdout.write(JSON.stringify(results), () => process.exit(0));
});
`;

function permissionFlag(): string | null {
  const flags = process.allowedNodeEnvironmentFlags;
  if (flags.has("--permission")) return "--permission";
  if (flags.has("--experimental-permission")) return "--experimental-permission";
  return null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== "object") return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// Bounded concurrency — each judge is a whole process, so an unbounded burst of submissions
// would exhaust the host. Excess submissions wait briefly; beyond the queue cap they get a 429.
let activeJudges = 0;
const waiting: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (activeJudges < MAX_CONCURRENT_JUDGES) {
    activeJudges += 1;
    return;
  }
  if (waiting.length >= MAX_QUEUED_JUDGES) {
    throw ApiError.tooMany("The code grader is busy. Please try again in a moment.");
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
  activeJudges += 1;
}

function releaseSlot(): void {
  activeJudges -= 1;
  waiting.shift()?.();
}

interface RunnerResult {
  ok: boolean;
  isUndefined?: boolean;
  json?: string | null;
  error?: string;
}

function runIsolated(code: string, functionName: string, tests: unknown[][]): Promise<RunnerResult[]> {
  const flag = permissionFlag();
  if (!flag) {
    // Fail closed: without the permission model there is no safe way to execute student code.
    return Promise.reject(ApiError.internal("The code grader is unavailable on this server"));
  }

  const totalTimeout = Math.min(MAX_TOTAL_TIMEOUT_MS, PER_TEST_TIMEOUT_MS * tests.length + 1000);

  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [flag, "--disallow-code-generation-from-strings", "--max-old-space-size=64", "--no-warnings", "-e", RUNNER_SOURCE],
      { env: {}, stdio: ["pipe", "pipe", "ignore"], windowsHide: true }
    );

    let stdout = "";
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      fn();
    };

    const timer = setTimeout(
      () => finish(() => resolve(tests.map(() => ({ ok: false, error: "Time limit exceeded" })))),
      totalTimeout
    );

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > MAX_OUTPUT_BYTES) {
        finish(() => resolve(tests.map(() => ({ ok: false, error: "Output limit exceeded" }))));
      }
    });
    child.on("error", (err) => finish(() => reject(err)));
    child.on("close", () =>
      finish(() => {
        try {
          const parsed = JSON.parse(stdout) as RunnerResult[];
          if (!Array.isArray(parsed) || parsed.length !== tests.length) throw new Error("bad shape");
          resolve(parsed);
        } catch {
          resolve(tests.map(() => ({ ok: false, error: "Execution failed (memory or runtime limit)" })));
        }
      })
    );

    child.stdin.on("error", () => undefined);
    child.stdin.end(JSON.stringify({ code, functionName, tests, timeoutMs: PER_TEST_TIMEOUT_MS }));
  });
}

/** Grades a submission against a lesson's test cases in an isolated process (see above). */
export async function runCodingSubmission(
  question: ICodingQuestion,
  code: string
): Promise<{ passed: boolean; testResults: ITestResult[] }> {
  if (typeof code !== "string" || code.length === 0) {
    throw ApiError.badRequest("Code is required");
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw ApiError.badRequest("Code is too long");
  }

  const fnName = question.functionName.trim();
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(fnName)) {
    throw ApiError.internal("Invalid function name configured for this question");
  }

  const tests = question.testCases.map((t) => (Array.isArray(t.args) ? t.args : []));

  await acquireSlot();
  let runnerResults: RunnerResult[];
  try {
    runnerResults = await runIsolated(code, fnName, tests);
  } finally {
    releaseSlot();
  }

  const testResults: ITestResult[] = question.testCases.map((testCase, i) => {
    const r = runnerResults[i];
    if (!r?.ok) {
      return { passed: false, args: testCase.args, expectedOutput: testCase.expectedOutput, error: r?.error ?? "Execution error" };
    }
    let actualOutput: unknown;
    try {
      actualOutput = r.isUndefined ? undefined : r.json == null ? null : JSON.parse(r.json);
    } catch {
      actualOutput = undefined;
    }
    return {
      passed: deepEqual(actualOutput, testCase.expectedOutput),
      args: testCase.args,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
    };
  });

  return { passed: testResults.every((r) => r.passed), testResults };
}
