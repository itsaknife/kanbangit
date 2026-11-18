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
const time = load("src/utils/worklog.ts");
const editor = load("src/utils/commentEditor.ts");
const errors = {
  "@/utils": { getErrorMessage: (e) => (e instanceof Error ? e.message : String(e)) },
};
test("worklog input uses Vietnam timezone independent of browser timezone", () => {
  assert.equal(time.vietnamInputToIso("2020-01-02T08:30"), "2020-01-02T01:30:00.000Z");
  assert.equal(time.vietnamDateTimeInput("2020-01-01T18:00:00Z"), "2020-01-02T01:00:00");
});
test("editing preserves API timestamps including seconds/milliseconds", () => {
  for (const input of ["2020-01-01T08:00:30.123Z", "2020-01-01T08:00:30.000Z"])
    assert.equal(
      time.vietnamInputToIso(time.vietnamDateTimeInput(input)),
      new Date(input).toISOString(),
    );
});
test("rejects malformed calendar inputs and future ranges", () => {
  for (const input of ["2026-02-30T08:00", "bad", "2020-13-02T08:00"])
    assert.throws(() => time.vietnamInputToIso(input));
  assert.throws(() => time.validateWorklogInput("2099-01-01T08:00", "2099-01-01T09:00"));
  assert.throws(() => time.validateWorklogInput("2020-01-01T09:00", "2020-01-01T08:00"));
});
test("duration feedback handles empty, multi-day and sub-minute values", () => {
  assert.equal(time.worklogInputMinutes("", ""), null);
  assert.equal(time.worklogInputMinutes("2020-01-01T23:00", "2020-01-03T01:00"), 1560);
  assert.equal(time.formatDuration(0.5), "30 giây");
  assert.equal(time.formatDuration(61.5), "1 giờ 1 phút 30 giây");
  assert.equal(time.formatDuration(null), "Chưa có quyền xem");
});
test("formatting wraps only the current selection and preserves surrounding text", () => {
  assert.deepEqual(editor.wrapSelection("hello world", 6, 11, "**"), {
    value: "hello **world**",
    start: 8,
    end: 13,
  });
});
test("mention query is caret aware and ignores email addresses", () => {
  assert.deepEqual(editor.mentionQuery("hello @ali rest", 10), { query: "ali", start: 6, end: 10 });
  assert.equal(editor.mentionQuery("hello@example.com", 17), null);
});
test("mention insertion contains stable user identity and leaves trailing text intact", () => {
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const value = editor.insertMention("hello @al rest", 6, 9, "alice", id);
  assert.equal(value.value, "hello [@alice](mention:" + id + ")  rest");
  assert.equal(time.displayMentionContent(value.value), "hello **@alice**  rest");
});
test("worklog service follows BE routes and query contract", async () => {
  const calls = [];
  const http = {
    get: async (...args) => {
      calls.push(["get", ...args]);
      return {};
    },
    post: async (...args) => {
      calls.push(["post", ...args]);
      return { id: "new" };
    },
    patch: async (...args) => {
      calls.push(["patch", ...args]);
      return { id: "existing" };
    },
  };
  const { worklogService } = load("src/services/worklog.service.ts", { "./http": { http } });
  await worklogService.list("repo", { period: "custom", from: "2020-01-01", to: "2020-01-02" });
  await worklogService.create("repo", "issue", { startAt: "s", endAt: "e" });
  await worklogService.summary("repo", "issue");
  assert.equal(calls[0][1], "/projects/repo/worklogs");
  assert.equal(calls[0][2].from, "2020-01-01");
  assert.equal(calls[1][1], "/projects/repo/issues/issue/worklogs");
  assert.equal(calls[2][1], "/projects/repo/issues/issue/time-summary");
});
test("comment uploads use FormData and downloads use authenticated blob client", async () => {
  const calls = [];
  const { commentService } = load("src/services/comment.service.ts", {
    "./http": {
      http: {
        upload: async (...args) => calls.push(args),
        blob: async (...args) => calls.push(args),
      },
    },
  });
  const file = new File(["content"], "file.txt", { type: "text/plain" });
  await commentService.upload("repo", "comment", file);
  await commentService.download("repo", "attachment");
  assert.equal(calls[0][0], "/projects/repo/comments/comment/attachments");
  assert.equal(calls[0][1].get("file").name, "file.txt");
  assert.equal(calls[1][0], "/projects/repo/attachments/attachment");
});
test("worklog store discards out-of-order responses", async () => {
  const pending = [];
  const { useWorklogsStore, worklogKey } = load("src/stores/worklogs.store.ts", {
    ...errors,
    "@/services/worklog.service": {
      worklogService: { list: () => new Promise((resolve) => pending.push(resolve)) },
    },
  });
  const a = useWorklogsStore.getState().load("repo", { period: "week" });
  const b = useWorklogsStore.getState().load("repo", { period: "week" });
  pending[1]({ data: [], totalMinutes: 120 });
  await b;
  pending[0]({ data: [], totalMinutes: 10 });
  await a;
  assert.equal(
    useWorklogsStore.getState().entries[worklogKey("repo", { period: "week" })].data.totalMinutes,
    120,
  );
});
test("failed worklog refresh clears cached private data and exposes retry error", async () => {
  let fail = false;
  const { useWorklogsStore, worklogKey } = load("src/stores/worklogs.store.ts", {
    ...errors,
    "@/services/worklog.service": {
      worklogService: {
        list: async () => {
          if (fail) throw new Error("Forbidden");
          return { data: [{ id: "private" }] };
        },
      },
    },
  });
  await useWorklogsStore.getState().load("repo", {});
  fail = true;
  await useWorklogsStore.getState().load("repo", {});
  const entry = useWorklogsStore.getState().entries[worklogKey("repo", {})];
  assert.equal(entry.data, undefined);
  assert.equal(entry.error, "Forbidden");
  assert.equal(entry.loading, false);
});
test("editing a worklog never sends a changed author", async () => {
  const calls = [];
  const { useWorklogsStore } = load("src/stores/worklogs.store.ts", {
    ...errors,
    "@/services/worklog.service": {
      worklogService: { update: async (...args) => calls.push(args) },
    },
  });
  await useWorklogsStore
    .getState()
    .save("repo", "issue", { startAt: "s", endAt: "e", memberId: "attempted-change" }, "worklog");
  assert.equal(calls[0][2].memberId, undefined);
  assert.equal(useWorklogsStore.getState().busy, false);
});
test("failed mutations release busy state and propagate validation errors", async () => {
  const { useWorklogsStore } = load("src/stores/worklogs.store.ts", {
    ...errors,
    "@/services/worklog.service": {
      worklogService: {
        create: async () => {
          throw new Error("overlap");
        },
      },
    },
  });
  await assert.rejects(useWorklogsStore.getState().save("repo", "issue", {}), /overlap/);
  assert.equal(useWorklogsStore.getState().busy, false);
});
test("comments store preserves loaded rows during refresh and rejects stale results", async () => {
  const pending = [];
  const { useCommentsStore, commentKey } = load("src/stores/comments.store.ts", {
    ...errors,
    "@/services/comment.service": {
      commentService: { list: () => new Promise((resolve) => pending.push(resolve)) },
    },
  });
  const first = useCommentsStore.getState().load("r", "i");
  pending[0]([{ id: "original" }]);
  await first;
  const second = useCommentsStore.getState().load("r", "i");
  assert.equal(useCommentsStore.getState().entries[commentKey("r", "i")].data[0].id, "original");
  const third = useCommentsStore.getState().load("r", "i");
  pending[2]([{ id: "latest" }]);
  await third;
  pending[1]([{ id: "old" }]);
  await second;
  assert.equal(useCommentsStore.getState().entries[commentKey("r", "i")].data[0].id, "latest");
});
