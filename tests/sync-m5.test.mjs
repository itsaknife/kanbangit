import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(relative, mocks = {}) {
  const filename = path.resolve(relative);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const module = { exports: {} };
  const resolve = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) return load("src/" + name.slice(2) + ".ts", mocks);
    if (name.startsWith("."))
      return load(path.resolve(path.dirname(filename), name + ".ts"), mocks);
    return require(name);
  };
  new Function("require", "module", "exports", outputText)(resolve, module, module.exports);
  return module.exports;
}
function store(service) {
  return load("src/stores/sync.store.ts", {
    "@/services/sync.service": { syncService: service },
    "@/utils": { getErrorMessage: (e) => e.message },
  });
}
test("sync services use the exact scoped BE endpoints and pagination", async () => {
  const calls = [];
  const http = {
    get: async (...args) => calls.push(["get", ...args]),
    post: async (...args) => calls.push(["post", ...args]),
  };
  const { syncService: s } = load("src/services/sync.service.ts", { "./http": { http } });
  await s.info("r", "i");
  await s.queue("r", 3);
  await s.retry("r", "i");
  await s.retry("r");
  assert.deepEqual(calls, [
    ["get", "/repositories/r/issues/i/sync"],
    ["get", "/repositories/r/sync/queue", { page: 3, limit: 20 }],
    ["post", "/repositories/r/issues/i/sync/retry"],
    ["post", "/repositories/r/sync/retry"],
  ]);
});
test("out-of-order sync info responses cannot regress the displayed state", async () => {
  const pending = [],
    { useSyncStore: s, syncKey } = store({
      info: () => new Promise((resolve) => pending.push(resolve)),
    });
  const a = s.getState().loadInfo("r", "i"),
    b = s.getState().loadInfo("r", "i");
  pending[1]({ syncStatus: "SYNCED" });
  await b;
  pending[0]({ syncStatus: "PENDING_SYNC" });
  await a;
  assert.equal(s.getState().details[syncKey("r", "i")].data.syncStatus, "SYNCED");
});
test("permission loss removes cached queue data and exposes retry error", async () => {
  let allowed = true;
  const { useSyncStore: s, syncKey } = store({
    queue: async () => {
      if (!allowed) throw new Error("Forbidden");
      return { data: [{ title: "private" }] };
    },
  });
  await s.getState().loadQueue("r", 1);
  allowed = false;
  await s.getState().loadQueue("r", 1);
  assert.equal(s.getState().queues[syncKey("r", 1)].data, undefined);
  assert.equal(s.getState().queues[syncKey("r", 1)].error, "Forbidden");
});
test("queue requests keep pages and repositories isolated", async () => {
  const { useSyncStore: s, syncKey } = store({
    queue: async (r, p) => ({ data: [{ title: `${r}-${p}` }] }),
  });
  await Promise.all([
    s.getState().loadQueue("a", 1),
    s.getState().loadQueue("a", 2),
    s.getState().loadQueue("b", 1),
  ]);
  for (const [r, p] of [
    ["a", 1],
    ["a", 2],
    ["b", 1],
  ])
    assert.equal(s.getState().queues[syncKey(r, p)].data.data[0].title, `${r}-${p}`);
});
test("retry locks repeated clicks, preserves error and always clears busy", async () => {
  let reject,
    calls = 0;
  const { useSyncStore: s } = store({
    retry: () => {
      calls++;
      return new Promise((_, no) => {
        reject = no;
      });
    },
  });
  const first = s.getState().retry("r", "i");
  assert.equal(s.getState().busy.r, true);
  assert.equal(await s.getState().retry("r"), 0);
  assert.equal(calls, 1);
  reject(new Error("Forbidden"));
  await assert.rejects(first, /Forbidden/);
  assert.equal(s.getState().busy.r, false);
});
test("successful retry reports accepted queue count rather than claiming GitHub success", async () => {
  const { useSyncStore: s } = store({ retry: async () => ({ queued: 4 }) });
  assert.equal(await s.getState().retry("r"), 4);
  assert.equal(s.getState().busy.r, false);
});
