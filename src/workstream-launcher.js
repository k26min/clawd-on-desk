"use strict";

// Double-clicking the pet opens HALOFLUX, the agent workstream visualizer.
// HALOFLUX is single-instance: launching it again only brings its window to
// the front, so repeated double-clicks never stack copies.
// Path: CLAWD_WORKSTREAM_APP overrides the default build location.

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const DEFAULT_WORKSTREAM_APP = path.join(
  "C:\\Users\\Kai\\Workspace\\Agent workstream visualization\\haloflux-main",
  "desktop", "dist", "HALOFLUX-win32-x64", "HaloFlux.exe"
);

// Markers of a parent Claude Code session. A claude started inside HALOFLUX's
// workspace panel that inherits them runs as a child session and saves no
// transcript, which leaves the visualizer with nothing to show.
const CLAUDE_SESSION_ENV = /^(CLAUDECODE|CLAUDE_PID|AI_AGENT|CLAUDE_CODE_(CHILD_SESSION|ENTRYPOINT|SESSION_.*|MESSAGING_.*))$/;

function resolveWorkstreamApp(env = process.env) {
  const fromEnv = env.CLAWD_WORKSTREAM_APP;
  return fromEnv && String(fromEnv).trim() ? String(fromEnv).trim() : DEFAULT_WORKSTREAM_APP;
}

function workstreamEnv(env = process.env) {
  const out = { ...env };
  for (const key of Object.keys(out)) if (CLAUDE_SESSION_ENV.test(key)) delete out[key];
  return out;
}

function createWorkstreamLauncher(deps = {}) {
  const spawnImpl = deps.spawn || spawn;
  const existsSync = deps.existsSync || fs.existsSync;
  const env = deps.env || process.env;
  const log = deps.log || (() => {});

  return function openWorkstream() {
    const exe = resolveWorkstreamApp(env);
    if (!existsSync(exe)) {
      log(`workstream app not found: ${exe}`);
      return false;
    }
    try {
      const child = spawnImpl(exe, [], {
        cwd: path.dirname(exe),
        env: workstreamEnv(env),
        detached: true,
        stdio: "ignore",
        windowsHide: false,
      });
      if (child && typeof child.on === "function") {
        child.on("error", (err) => log(`workstream app failed to start: ${err && err.message}`));
      }
      if (child && typeof child.unref === "function") child.unref();
      return true;
    } catch (err) {
      log(`workstream app failed to start: ${err && err.message}`);
      return false;
    }
  };
}

module.exports = {
  DEFAULT_WORKSTREAM_APP,
  resolveWorkstreamApp,
  workstreamEnv,
  createWorkstreamLauncher,
};
