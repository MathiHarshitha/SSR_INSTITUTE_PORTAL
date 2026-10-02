import { runCodingSubmission } from "../src/utils/codingJudge";
import { ICodingQuestion } from "../src/models/Lesson";

const addQuestion = {
  prompt: "Add two numbers",
  starterCode: "function add(a, b) {}",
  functionName: "add",
  testCases: [
    { args: [1, 2], expectedOutput: 3 },
    { args: [5, 7], expectedOutput: 12 },
  ],
} as unknown as ICodingQuestion;

jest.setTimeout(30000);

describe("Coding judge isolation", () => {
  it("grades a correct solution as passed and a wrong one as failed", async () => {
    const ok = await runCodingSubmission(addQuestion, "function add(a, b) { return a + b; }");
    expect(ok.passed).toBe(true);

    const bad = await runCodingSubmission(addQuestion, "function add(a, b) { return a - b; }");
    expect(bad.passed).toBe(false);
  });

  it("does not expose the API process's secrets to submitted code", async () => {
    process.env.JWT_SECRET = "test-secret-must-not-leak";
    const escape = `function add() {
      const p = this.constructor.constructor("return process")();
      return p.env.JWT_SECRET;
    }`;
    const res = await runCodingSubmission(addQuestion, escape);
    expect(res.passed).toBe(false);
    for (const r of res.testResults) expect(JSON.stringify(r.actualOutput ?? null)).not.toContain("must-not-leak");
  });

  it("blocks child_process and filesystem access even after a realm escape", async () => {
    const q = { ...addQuestion, testCases: [{ args: [], expectedOutput: "never" }] } as unknown as ICodingQuestion;
    const attempts = [
      `function add() { return __args.constructor.constructor("return process")().getBuiltinModule("child_process").execSync("echo pwned").toString(); }`,
      `function add() { return __args.constructor.constructor("return process")().getBuiltinModule("fs").readFileSync(".env", "utf8"); }`,
    ];
    for (const code of attempts) {
      const res = await runCodingSubmission(q, code);
      expect(res.passed).toBe(false);
      expect(res.testResults[0].actualOutput).toBeUndefined();
      expect(res.testResults[0].error).toBeDefined();
    }
  });

  it("fails escape attempts for the right reason (blocked), not because the runner crashed", async () => {
    const q = { ...addQuestion, testCases: [{ args: [], expectedOutput: "x" }] } as unknown as ICodingQuestion;

    const realm = await runCodingSubmission(q, `function add() { return this.constructor.constructor("return process")(); }`);
    expect(realm.testResults[0].error).toMatch(/Code generation from strings disallowed/);

    const evalTry = await runCodingSubmission(q, `function add() { return eval("1"); }`);
    expect(evalTry.testResults[0].error).toMatch(/Code generation from strings disallowed/);

    const globals = await runCodingSubmission(q, `function add() { return typeof require + "," + typeof process; }`);
    expect(globals.testResults[0].actualOutput).toBe("undefined,undefined");

    const memory = await runCodingSubmission(q, `function add() { const a = []; while (true) a.push(new Array(1e6).fill(1)); }`);
    expect(memory.passed).toBe(false);
    expect(memory.testResults[0].error).toBeDefined();
  });

  it("kills infinite loops, including microtask loops that bypass the vm timeout", async () => {
    const started = Date.now();
    const sync = await runCodingSubmission(addQuestion, "function add() { while (true) {} }");
    expect(sync.passed).toBe(false);

    const micro = await runCodingSubmission(
      addQuestion,
      "function add() { const spin = () => Promise.resolve().then(spin); spin(); return 3; }"
    );
    expect(micro.passed).toBe(false);
    expect(Date.now() - started).toBeLessThan(25000);
  });

  it("removes off-heap allocators (typed arrays, ArrayBuffer, WebAssembly) from the sandbox", async () => {
    const q = { ...addQuestion, testCases: [{ args: [], expectedOutput: "x" }] } as unknown as ICodingQuestion;

    const probe = await runCodingSubmission(
      q,
      `function add() { return [typeof Uint8Array, typeof ArrayBuffer, typeof SharedArrayBuffer, typeof DataView,
        typeof Atomics, typeof WebAssembly, typeof Float64Array, typeof BigInt64Array].join(","); }`
    );
    expect(probe.testResults[0].actualOutput).toBe(Array(8).fill("undefined").join(","));

    const alloc = await runCodingSubmission(q, `function add() { const b = new Uint8Array(1e9); return b.length; }`);
    expect(alloc.passed).toBe(false);
    expect(alloc.testResults[0].errorName).toBe("ReferenceError");

    // Not recoverable through the args (built inside the sandbox realm) or other prototypes.
    const recover = await runCodingSubmission(
      q,
      `function add() {
        const fromArgs = __args.constructor === Array && Object.getPrototypeOf(__args) === Array.prototype;
        return String(fromArgs) + "," + typeof globalThis.__argsJson;
      }`
    );
    expect(recover.testResults[0].actualOutput).toBe("true,undefined");
  });

  it("passes args through intact", async () => {
    const q = {
      ...addQuestion,
      functionName: "echo",
      testCases: [{ args: [[1, 2], { a: "b" }, null, "s"], expectedOutput: [[1, 2], { a: "b" }, null, "s"] }],
    } as unknown as ICodingQuestion;
    const res = await runCodingSubmission(q, "function echo(...a) { return a; }");
    expect(res.passed).toBe(true);
  });

  it("truncates large outputs in the stored result but grades on the full value", async () => {
    const big = "y".repeat(5000);
    const q = {
      ...addQuestion,
      testCases: [
        { args: [], expectedOutput: big },
        { args: [], expectedOutput: "nope" },
      ],
    } as unknown as ICodingQuestion;
    const res = await runCodingSubmission(q, `function add() { return "y".repeat(5000); }`);
    expect(res.testResults[0].passed).toBe(true);
    expect(res.testResults[1].passed).toBe(false);
    for (const r of res.testResults) {
      expect(typeof r.actualOutput).toBe("string");
      expect((r.actualOutput as string).length).toBeLessThanOrEqual(1001);
      expect((r.actualOutput as string).endsWith("…")).toBe(true);
    }
  });

  it("caps total output size", async () => {
    const q = { ...addQuestion, testCases: [{ args: [], expectedOutput: "x" }] } as unknown as ICodingQuestion;
    const res = await runCodingSubmission(q, `function add() { return "z".repeat(400 * 1024); }`);
    expect(res.passed).toBe(false);
    expect(res.testResults[0].error).toBe("Output limit exceeded");
    expect(res.testResults[0].graderError).toBe(true);
  });

  it("flags only grader-generated errors as safe to show; runtime errors keep their type", async () => {
    const q = { ...addQuestion, testCases: [{ args: ["secret-input"], expectedOutput: "x" }] } as unknown as ICodingQuestion;

    const thrown = await runCodingSubmission(q, `function add(s) { throw new TypeError("leak " + s); }`);
    expect(thrown.testResults[0].graderError).toBe(false);
    expect(thrown.testResults[0].errorName).toBe("TypeError");

    const syntax = await runCodingSubmission(q, `function add( {`);
    expect(syntax.testResults[0].graderError).toBe(true);

    const missing = await runCodingSubmission(q, `function other() {}`);
    expect(missing.testResults[0].error).toBe("add is not defined");
    expect(missing.testResults[0].graderError).toBe(true);
  });

  it("never lets a forged verdict pass — grading happens outside the sandbox", async () => {
    const forge = `function add() {
      const p = this.constructor.constructor("return process")();
      p.stdout.write(JSON.stringify([{ ok: true, json: "3" }, { ok: true, json: "12" }]));
      p.exit(0);
    }`;
    const res = await runCodingSubmission(addQuestion, forge);
    // Even if the escape could print, it only controls *actual* outputs; expected outputs never
    // enter the sandbox, so forging requires knowing the answers (i.e. solving the problem).
    // Here the realm escape itself is blocked by --disallow-code-generation-from-strings.
    expect(res.passed).toBe(false);
  });
});
