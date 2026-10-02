import { spawn } from "node:child_process";
import { ICodingQuestion } from "../models/Lesson";
import { ITestResult } from "../models/CodingSubmission";
import { ApiError } from "./ApiError";

const PER_TEST_TIMEOUT_MS = 2000;
const MAX_TOTAL_TIMEOUT_MS = 10000;
const MAX_CODE_LENGTH = 20000;
const MAX_OUTPUT_BYTES = 256 * 1024;
/** Longest serialized actualOutput kept per test result in the stored submission. */
const MAX_STORED_OUTPUT_CHARS = 1000;
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
 *     with microtasks); the heap cap doesn't cover ArrayBuffer backing stores, so every
 *     buffer/typed-array/WebAssembly constructor is deleted from each sandbox global,
 *   - gets its test arguments rebuilt inside the sandbox realm (no runner-realm objects are
 *     ever handed to student code),
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
  // Off-heap allocators: --max-old-space-size doesn't bound ArrayBuffer backing stores (or
  // WebAssembly.Memory), so they're removed from every sandbox global. Nothing else in the
  // sandbox hands out a buffer, so they can't be recovered via a prototype chain.
  const prepare = new vm.Script(
    "for (const k of " + JSON.stringify([
      "ArrayBuffer", "SharedArrayBuffer", "DataView", "Atomics", "WebAssembly",
      "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array",
      "Int32Array", "Uint32Array", "Float16Array", "Float32Array", "Float64Array",
      "BigInt64Array", "BigUint64Array",
    ]) + ") delete globalThis[k];" +
    // Args are rebuilt from a JSON string inside the sandbox realm, so student code never
    // holds an object from the runner's realm.
    "globalThis.__args = JSON.parse(globalThis.__argsJson); delete globalThis.__argsJson;"
  );
  let script = null;
  let compileError = null;
  try {
    script = new vm.Script(
      code + "\n;(typeof " + functionName + " === \"function\" ? " + functionName +
        "(...__args) : (() => { throw new Error(" + JSON.stringify(functionName + " is not defined") + ") })())"
    );
  } catch (err) {
    let message = "Syntax error";
    try { message = String((err && err.message) || err).slice(0, 500); } catch {}
    compileError = { ok: false, error: message, errorName: "SyntaxError", graderError: true };
  }
  const results = [];
  for (const args of tests) {
    if (compileError) { results.push(compileError); continue; }
    const context = vm.createContext(Object.create(null), {
      codeGeneration: { strings: false, wasm: false },
      microtaskMode: "afterEvaluate",
    });
    context.__argsJson = JSON.stringify(args);
    try {
      prepare.runInContext(context);
      const out = script.runInContext(context, { timeout: timeoutMs });
      let json;
      try { json = JSON.stringify(out); } catch { json = undefined; }
      results.push({ ok: true, isUndefined: out === undefined, json: json === undefined ? null : json });
    } catch (err) {
      // A runner-realm Error here can only come from vm itself (student throws are sandbox-realm).
      if (err instanceof Error && err.code === "ERR_SCRIPT_EXECUTION_TIMEOUT") {
        results.push({ ok: false, error: "Time limit exceeded", graderError: true });
        continue;
      }
      let message = "Execution error";
      let name;
      try { message = String((err && err.message) || err).slice(0, 500); } catch {}
      try {
        const n = err && err.name;
        // Only built-in error types: a free-form name is student-controlled and could carry a test input.
        if (typeof n === "string" && /^(Error|TypeError|RangeError|ReferenceError|SyntaxError|EvalError|URIError|AggregateError|InternalError)$/.test(n)) name = n;
      } catch {}
      results.push({ ok: false, error: message, errorName: name });
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
  errorName?: string;
  /** The message was produced by the grader itself (limits, syntax errors), not by running
   * the student's code against a test's inputs — so it's safe to show verbatim. */
  graderError?: boolean;
}

function limitFailure(error: string): RunnerResult {
  return { ok: false, error, graderError: true };
}

/** Keeps a stored submission small: an oversized output is replaced by a string preview. */
function truncateForStorage(value: unknown): unknown {
  let json: string | undefined;
  try {
    json = JSON.stringify(value);
  } catch {
    return undefined;
  }
  if (json === undefined || json.length <= MAX_STORED_OUTPUT_CHARS) return value;
  return `${json.slice(0, MAX_STORED_OUTPUT_CHARS)}…`;
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
      () => finish(() => resolve(tests.map(() => limitFailure("Time limit exceeded")))),
      totalTimeout
    );

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > MAX_OUTPUT_BYTES) {
        finish(() => resolve(tests.map(() => limitFailure("Output limit exceeded"))));
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
          resolve(tests.map(() => limitFailure("Execution failed (memory or runtime limit)")));
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
      const error = r?.error ?? "Execution error";
      return {
        passed: false,
        args: testCase.args,
        expectedOutput: testCase.expectedOutput,
        error,
        ...(r?.errorName ? { errorName: r.errorName } : {}),
        // The "not defined" message is fixed text built from the question, not from inputs.
        graderError: r?.graderError === true || error === `${fnName} is not defined`,
      };
    }
    let actualOutput: unknown;
    try {
      actualOutput = r.isUndefined ? undefined : r.json == null ? null : JSON.parse(r.json);
    } catch {
      actualOutput = undefined;
    }
    // Compare against the full output first; only the stored copy is truncated.
    const passed = deepEqual(actualOutput, testCase.expectedOutput);
    return {
      passed,
      args: testCase.args,
      expectedOutput: testCase.expectedOutput,
      actualOutput: truncateForStorage(actualOutput),
    };
  });

  return { passed: testResults.every((r) => r.passed), testResults };
}
