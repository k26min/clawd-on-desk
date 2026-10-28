"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");

const {
  DEFAULT_WORKSTREAM_APP,
  resolveWorkstreamApp,
  workstreamEnv,
  createWorkstreamLauncher,
} = require("../src/workstream-launcher");

function fakeSpawn() {
  const calls = [];
  const spawn = (exe, args, opts) => {
    calls.push({ exe, args, opts });
    return { on() {}, unref() { calls[calls.length - 1].unref = true; } };
  };
  return { spawn, calls };
}

describe("workstream launcher", () => {
  it("uses the default build path unless CLAWD_WORKSTREAM_APP is set", () => {
    assert.strictEqual(resolveWorkstreamApp({}), DEFAULT_WORKSTREAM_APP);
    assert.strictEqual(resolveWorkstreamApp({ CLAWD_WORKSTREAM_APP: " D:\\x\\HaloFlux.exe " }), "D:\\x\\HaloFlux.exe");
  });

  it("starts the app detached, without parent Claude Code session markers", () => {
    const { spawn, calls } = fakeSpawn();
    const env = { PATH: "p", CLAUDECODE: "1", CLAUDE_CODE_CHILD_SESSION: "1", CLAUDE_CODE_SESSION_ID: "s", CLAUDE_CONFIG_DIR: "keep" };
    const open = createWorkstreamLauncher({ spawn, existsSync: () => true, env });
    assert.strictEqual(open(), true);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].exe, DEFAULT_WORKSTREAM_APP);
    assert.strictEqual(calls[0].opts.detached, true);
    assert.strictEqual(calls[0].unref, true);
    assert.deepStrictEqual(calls[0].opts.env, { PATH: "p", CLAUDE_CONFIG_DIR: "keep" });
  });

  it("logs and does nothing when the app is missing", () => {
    const { spawn, calls } = fakeSpawn();
    const logs = [];
    const open = createWorkstreamLauncher({ spawn, existsSync: () => false, env: {}, log: (m) => logs.push(m) });
    assert.strictEqual(open(), false);
    assert.strictEqual(calls.length, 0);
    assert.match(logs[0], /not found/);
  });

  it("keeps unrelated variables", () => {
    assert.deepStrictEqual(workstreamEnv({ A: "1", CLAUDE_CODE_MESSAGING_TOKEN: "t", AI_AGENT: "x" }), { A: "1" });
  });
});
