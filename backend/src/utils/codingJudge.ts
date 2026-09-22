import vm from "node:vm";
import { ICodingQuestion } from "../models/Lesson";
import { ITestResult } from "../models/CodingSubmission";

const EXECUTION_TIMEOUT_MS = 2000;
const MAX_CODE_LENGTH = 20000;

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

/**
 * Runs student-submitted JS against a lesson's test cases inside Node's `vm` module: a
 * fresh, isolated global context with no `require`, no `process`, no filesystem/network
 * access, and a hard wall-clock timeout per execution. This is sandboxing appropriate for
 * a training exercise (not a hostile multi-tenant judge) — good enough to auto-grade
 * simple pure functions without giving submitted code any I/O capability.
 */
export function runCodingSubmission(
  question: ICodingQuestion,
  code: string
): { passed: boolean; testResults: ITestResult[] } {
  if (typeof code !== "string" || code.length === 0) {
    throw new Error("Code is required");
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new Error("Code is too long");
  }

  const testResults: ITestResult[] = [];

  const fnName = question.functionName.trim();
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(fnName)) {
    throw new Error("Invalid function name configured for this question");
  }

  for (const testCase of question.testCases) {
    const context = vm.createContext({ __args: testCase.args });
    let actualOutput: unknown;
    let error: string | undefined;

    try {
      const script = new vm.Script(
        `${code}\n;(typeof ${fnName} === "function" ? ${fnName}(...__args) : (() => { throw new Error(${JSON.stringify(
          `${fnName} is not defined`
        )}) })())`
      );
      actualOutput = script.runInContext(context, { timeout: EXECUTION_TIMEOUT_MS });
    } catch (err) {
      error = err instanceof Error ? err.message : "Execution error";
    }

    const passed = error === undefined && deepEqual(actualOutput, testCase.expectedOutput);
    testResults.push({
      passed,
      args: testCase.args,
      expectedOutput: testCase.expectedOutput,
      actualOutput: error === undefined ? actualOutput : undefined,
      error,
    });
  }

  return { passed: testResults.every((r) => r.passed), testResults };
}
