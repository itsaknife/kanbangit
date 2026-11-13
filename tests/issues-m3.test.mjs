import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);

// Exercise the actual TypeScript modules without adding a test dependency or writing compiled artifacts.
function load(relative, mocks = {}) {
  const filename = path.resolve(relative);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  const compiled = { exports: {} };
  const resolve = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) return load("src/" + name.slice(2) + ".ts", mocks);
    if (name.startsWith("."))
      return load(path.resolve(path.dirname(filename), name + ".ts"), mocks);
    return require(name);
  };
  new Function("require", "module", "exports", outputText)(resolve, compiled, compiled.exports);
  return compiled.exports;
}
const { upsertIssue, removeIssue } = load("src/utils/issueList.ts");
const { groupIssuesByStatus } = load("src/utils/groupIssuesByStatus.ts");
const { BOARD_COLUMNS } = load("src/constants/board.ts");
const { DEFAULT_ISSUE_FILTERS } = load("src/constants/issues.ts");
const { filterIssues } = load("src/utils/filterIssues.ts", { "@/constants": { ALL: "all" } });
const repoId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const firstId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const secondId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
function issue(id = firstId, extra = {}) {
  return {
    id,
    number: null,
    issueCode: "TASK-1",
    title: "Local task",
    body: null,
    status: "todo",
    trackerId: "tracker",
    assigneeId: null,
    assignees: [],
    labels: [],
    htmlUrl: null,
    updatedAt: null,
    createdAt: null,
    closedAt: null,
    startDate: null,
    endDate: null,
    estimateMinutes: null,
    parentId: null,
    subIssueEstimateMinutes: 0,
    combinedEstimateMinutes: null,
    syncStatus: "PENDING_SYNC",
    ...extra,
  };
}
function storeWith(service) {
  return load("src/stores/issues.store.ts", {
    "@/services": { issueService: service },
    "@/utils": { upsertIssue, getErrorMessage: (error) => error.message },
  }).useIssuesStore;
}

test("UUID upsert and removal keep separate local issues with null GitHub numbers", () => {
  let issues = upsertIssue([], issue());
  issues = upsertIssue(issues, issue(secondId));
  issues = upsertIssue(issues, issue(firstId, { title: "Edited" }));
  assert.equal(issues.length, 2);
  assert.equal(issues.find((item) => item.id === firstId).title, "Edited");
  assert.deepEqual(
    removeIssue(issues, secondId).map((item) => item.id),
    [firstId],
  );
});

test("all nine statuses have columns, including issues with null GitHub timestamps", () => {
  const rows = BOARD_COLUMNS.map(({ status }, index) => issue(String(index), { status }));
  const grouped = groupIssuesByStatus(rows);
  assert.equal(Object.keys(grouped).length, 9);
  for (const { status } of BOARD_COLUMNS) assert.equal(grouped[status].length, 1);
  assert.doesNotThrow(() => groupIssuesByStatus([issue(), issue(secondId)]));
});

test("search includes body, ignores absent GitHub numbers, and filters all nine statuses", () => {
  const rows = BOARD_COLUMNS.map(({ status }, index) =>
    issue(String(index), { status, body: "Unique description" }),
  );
  assert.equal(filterIssues(rows, { ...DEFAULT_ISSUE_FILTERS, search: "DESCRIPTION" }).length, 9);
  assert.equal(filterIssues(rows, { ...DEFAULT_ISSUE_FILTERS, search: "null" }).length, 0);
  for (const { status } of BOARD_COLUMNS) {
    const filtered = filterIssues(rows, { ...DEFAULT_ISSUE_FILTERS, status });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].status, status);
  }
  assert.equal(
    filterIssues([issue(firstId, { number: 42 })], { ...DEFAULT_ISSUE_FILTERS, search: "#42" })
      .length,
    1,
  );
});

test("calendar end-date filters include both boundaries and exclude undated issues", () => {
  const rows = [
    issue(firstId, { endDate: "2026-11-13" }),
    issue(secondId, { endDate: "2026-11-14" }),
    issue("undated"),
  ];
  assert.deepEqual(
    filterIssues(rows, {
      ...DEFAULT_ISSUE_FILTERS,
      dueFrom: "2026-11-13",
      dueTo: "2026-11-13",
    }).map((item) => item.id),
    [firstId],
  );
});

test("service uses UUID routes, unwraps the list envelope, and preserves raw mutation payloads", async () => {
  const calls = [];
  const http = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      async (...args) => {
        calls.push([method, ...args]);
        return method === "get"
          ? { data: [], pagination: { page: 1, limit: 200, total: 0, totalPages: 0 } }
          : issue();
      },
    ]),
  );
  const { issueService } = load("src/services/issue.service.ts", { "./http": { http } });
  const base = "/repositories/" + repoId + "/issues";
  assert.deepEqual(await issueService.list(repoId), []);
  assert.deepEqual(calls.pop(), ["get", base, { page: 1, limit: 200 }]);
  await issueService.getById(repoId, firstId);
  assert.deepEqual(calls.pop(), ["get", base + "/" + firstId]);
  const payload = {
    title: "Local",
    trackerId: "tracker",
    assigneeId: null,
    startDate: "2026-11-13",
    endDate: null,
    estimateMinutes: 30,
    parentId: null,
  };
  await issueService.create(repoId, payload);
  assert.deepEqual(calls.pop(), ["post", base, payload]);
  await issueService.update(repoId, firstId, payload);
  assert.deepEqual(calls.pop(), ["patch", base + "/" + firstId, payload]);
  await issueService.updateStatus(repoId, firstId, "verified");
  assert.deepEqual(calls.pop(), [
    "patch",
    base + "/" + firstId + "/status",
    { status: "verified" },
  ]);
  await issueService.setParent(repoId, firstId, secondId);
  assert.deepEqual(calls.pop(), ["put", base + "/" + firstId + "/parent", { parentId: secondId }]);
  await issueService.removeParent(repoId, firstId);
  assert.deepEqual(calls.pop(), ["delete", base + "/" + firstId + "/parent"]);
  await issueService.subIssues(repoId, firstId);
  assert.deepEqual(calls.pop(), ["get", base + "/" + firstId + "/sub-issues"]);
  await issueService.cascadeClose(repoId, firstId);
  assert.deepEqual(calls.pop(), ["post", base + "/" + firstId + "/cascade-close"]);
});

test("local create retains PENDING_SYNC and distinct issues before a GitHub number exists", async () => {
  let next = 0;
  const store = storeWith({ create: async () => issue(next++ ? secondId : firstId) });
  await store.getState().createIssue(repoId, { title: "First", trackerId: "tracker" });
  await store.getState().createIssue(repoId, { title: "Second", trackerId: "tracker" });
  const entry = store.getState().byRepository[repoId];
  assert.equal(entry.issues.length, 2);
  assert.equal(entry.isCreating, false);
  for (const item of entry.issues) {
    assert.equal(item.number, null);
    assert.equal(item.htmlUrl, null);
    assert.equal(item.syncStatus, "PENDING_SYNC");
  }
});

test("failed optimistic move rolls back only the target UUID and shows the backend error", async () => {
  let rejectMove;
  const store = storeWith({
    updateStatus: () =>
      new Promise((resolve, reject) => {
        rejectMove = reject;
      }),
  });
  store.getState().applyIssue(repoId, issue());
  store.getState().applyIssue(repoId, issue(secondId));
  const moving = store.getState().moveIssue(repoId, firstId, "closed");
  assert.equal(store.getState().byRepository[repoId].isMoving, true);
  assert.equal(
    store.getState().byRepository[repoId].issues.find((item) => item.id === firstId).status,
    "closed",
  );
  store.getState().applyIssue(repoId, issue(secondId, { title: "Socket update" }));
  rejectMove(new Error("Close child issues first"));
  await moving;
  const entry = store.getState().byRepository[repoId];
  assert.equal(entry.issues.find((item) => item.id === firstId).status, "todo");
  assert.equal(entry.issues.find((item) => item.id === secondId).title, "Socket update");
  assert.equal(entry.actionError, "Close child issues first");
  assert.equal(entry.isMoving, false);
});

test("successful drag sends the UUID and reconciles server sync status", async () => {
  const calls = [];
  const store = storeWith({
    updateStatus: async (...args) => {
      calls.push(args);
      return issue(firstId, { status: "paused" });
    },
  });
  store.getState().applyIssue(repoId, issue());
  await store.getState().moveIssue(repoId, firstId, "paused");
  assert.deepEqual(calls, [[repoId, firstId, "paused"]]);
  assert.equal(store.getState().byRepository[repoId].issues[0].status, "paused");
  assert.equal(store.getState().byRepository[repoId].isMoving, false);
});

function formHarness(
  initialValues = {},
  extraProps = {},
  issueEntry = { issues: [], loading: false, loaded: true },
) {
  const effects = [];
  let issueFetches = 0;
  const payloads = [];
  const stateUpdates = [];
  const trackers = [
    { id: "inactive", name: "Old", prefix: "OLD", isActive: false },
    { id: "active-first", name: "Task", prefix: "TASK", isActive: true },
    { id: "active-second", name: "Bug", prefix: "BUG", isActive: true },
  ];
  const Select = () => null;
  const ui = Object.fromEntries(
    ["Avatar", "Button", "Input", "Textarea"].map((name) => [name, () => null]),
  );
  ui.Select = Select;
  const { IssueForm } = load("src/components/issues/IssueForm.tsx", {
    react: {
      useState: (initial) => [initial, (value) => stateUpdates.push(value)],
      useEffect: (effect) => effects.push(effect),
    },
    "@/components/ui": ui,
    "@/components/repositories/TrackerIcon": { TrackerIcon: () => null },
    "@/hooks": {
      useRepoId: () => repoId,
      useAssignees: () => ({
        assignees: [{ id: "active-member", login: "active", avatarUrl: "" }],
        loading: false,
      }),
      useDuplicateCheck: () => ({
        result: null,
        checking: false,
        check: async () => null,
        reset: () => {},
      }),
    },
    "@/stores/trackers.store": {
      useTrackersStore: (select) =>
        select({
          byRepository: { [repoId]: { items: trackers, loading: false, loaded: true } },
          fetch: async () => {},
        }),
    },
    "@/stores/issues.store": {
      useIssuesStore: (select) =>
        select({
          byRepository: { [repoId]: issueEntry },
          fetchIssues: async () => {
            issueFetches++;
          },
        }),
    },
    "@/utils": { getErrorMessage: (error) => error.message },
    "./DuplicateWarning": { DuplicateWarning: () => null },
    "@/constants": { BOARD_COLUMNS },
  });
  const form = IssueForm({
    initialValues: { title: "Task", ...initialValues },
    submitLabel: "Save",
    onSubmit: async (payload) => {
      payloads.push(payload);
    },
    onCancel: () => {},
    ...extraProps,
  });
  const nodes = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    nodes.push(node);
    walk(node.props?.children);
  };
  walk(form);
  return {
    runEffects: () => effects.forEach((effect) => effect()),
    issueFetches: () => issueFetches,
    payloads,
    stateUpdates,
    nodes,
    Select,
    submit: () => form.props.onSubmit({ preventDefault: () => {} }),
  };
}

test("opening a create form retains the loaded board instead of triggering a loading/unmount loop", () => {
  const loaded = formHarness();
  loaded.runEffects();
  assert.equal(loaded.issueFetches(), 0);
  const unloaded = formHarness({}, {}, { issues: [], loading: false, loaded: false });
  unloaded.runEffects();
  assert.equal(unloaded.issueFetches(), 1);
});

test("new form defaults to first active tracker and keeps labels disabled", async () => {
  const form = formHarness();
  await form.submit();
  assert.equal(form.payloads[0].trackerId, "active-first");
  assert.equal(form.payloads[0].status, "todo");
  assert.equal(
    form.nodes.find((node) => node.type === form.Select && node.props.label === "Label").props
      .disabled,
    true,
  );
  for (const key of ["labels", "assignees", "number", "htmlUrl"])
    assert.equal(key in form.payloads[0], false);
});

test("edit preserves inactive tracker and historical assignee snapshot, and supports clearing body", async () => {
  const form = formHarness(
    { trackerId: "inactive", assigneeId: "former-member", body: "" },
    {
      initialAssignee: {
        login: "former-user",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
      },
    },
  );
  const assignee = form.nodes.find(
    (node) => node.type === form.Select && node.props.value === "former-member",
  );
  const option = assignee.props.options.find((item) => item.value === "former-member");
  assert.match(option.label, /former-user/);
  assert.equal(option.disabled, true);
  await form.submit();
  assert.equal(form.payloads[0].trackerId, "inactive");
  assert.equal(form.payloads[0].assigneeId, "former-member");
  assert.equal(form.payloads[0].body, "");
});

test("form sends calendar strings and nullable fields without converting dates to UTC", async () => {
  const form = formHarness({
    startDate: "2026-11-13",
    endDate: "2026-11-14",
    estimateHours: "0.5",
  });
  await form.submit();
  assert.equal(form.payloads[0].startDate, "2026-11-13");
  assert.equal(form.payloads[0].endDate, "2026-11-14");
  assert.equal(form.payloads[0].estimateMinutes, 30);
  assert.equal(form.payloads[0].parentId, null);
  const blank = formHarness();
  await blank.submit();
  assert.equal(blank.payloads[0].startDate, null);
  assert.equal(blank.payloads[0].endDate, null);
  assert.equal(blank.payloads[0].estimateMinutes, null);
});

test("form rejects reversed dates and estimates outside nonnegative half-hour steps", async () => {
  for (const fields of [
    { startDate: "2026-11-14", endDate: "2026-11-13" },
    { estimateHours: "-0.5" },
    { estimateHours: "0.1" },
    { estimateHours: "0.25" },
  ]) {
    const form = formHarness(fields);
    await form.submit();
    assert.equal(form.payloads.length, 0);
    assert.ok(form.stateUpdates.some((value) => typeof value === "string"));
  }
});

test("list fetches all envelope pages at limit 200 and returns a flat array", async () => {
  const calls = [];
  const pages = [[issue(firstId)], [issue(secondId)], [issue("third")]];
  const { issueService } = load("src/services/issue.service.ts", {
    "./http": {
      http: {
        get: async (url, query) => {
          calls.push([url, query]);
          return {
            data: pages[query.page - 1],
            pagination: { page: query.page, limit: 200, total: 3, totalPages: 3 },
          };
        },
      },
    },
  });
  assert.deepEqual(
    (await issueService.list(repoId)).map((item) => item.id),
    [firstId, secondId, "third"],
  );
  assert.deepEqual(
    calls.map(([, query]) => query),
    [
      { page: 1, limit: 200 },
      { page: 2, limit: 200 },
      { page: 3, limit: 200 },
    ],
  );
  for (const [url] of calls) assert.equal(url, "/repositories/" + repoId + "/issues");
});

test("list rejects later page failures instead of supplying an incomplete board", async () => {
  const { issueService } = load("src/services/issue.service.ts", {
    "./http": {
      http: {
        get: async (url, query) => {
          if (query.page === 2) throw new Error("Page unavailable");
          return {
            data: [issue()],
            pagination: { page: 1, limit: 200, total: 201, totalPages: 2 },
          };
        },
      },
    },
  });
  await assert.rejects(issueService.list(repoId), /Page unavailable/);
});

test("list supports a running backend returning the legacy array", async () => {
  let calls = 0;
  const { issueService } = load("src/services/issue.service.ts", {
    "./http": {
      http: {
        get: async () => {
          calls++;
          return [issue()];
        },
      },
    },
  });
  const result = await issueService.list(repoId);
  assert.equal(result.length, 1);
  assert.equal(calls, 1);
});

test("list reports malformed response shapes explicitly", async () => {
  for (const response of [null, {}, { data: [] }, { data: [], pagination: { totalPages: -1 } }]) {
    const { issueService } = load("src/services/issue.service.ts", {
      "./http": { http: { get: async () => response } },
    });
    await assert.rejects(issueService.list(repoId), /API danh sách issue/);
  }
});

test("stored error strings retain their message", () => {
  const { getErrorMessage } = load("src/utils/getErrorMessage.ts");
  assert.equal(getErrorMessage("API không hợp lệ"), "API không hợp lệ");
});

test("hours convert to integer minutes while blank and zero stay distinct", async () => {
  for (const [hours, minutes] of [
    ["", null],
    ["0", 0],
    ["0.5", 30],
    ["2", 120],
    ["2.5", 150],
  ]) {
    const form = formHarness({ estimateHours: hours });
    await form.submit();
    assert.equal(form.payloads[0].estimateMinutes, minutes);
    const control = form.nodes.find((node) => node.props?.name === "estimateHours");
    assert.equal(control.props.step, 0.5);
    assert.match(control.props.label, /giờ/);
  }
  const { formatEstimateHours } = load("src/utils/formatEstimateHours.ts");
  assert.equal(formatEstimateHours(null), "Chưa có");
  assert.equal(formatEstimateHours(0), "0 giờ");
  assert.equal(formatEstimateHours(120), "2 giờ");
  assert.equal(formatEstimateHours(30), "0.5 giờ");
});

test("detail refreshes totals for other issue events and retains the same form source", () => {
  const listeners = new Map();
  const applied = [];
  let reloads = 0;
  const current = issue(firstId);
  const store = {
    loadIssue: async () => current,
    updateIssue: async () => {},
    updateStatus: async () => {},
    applyIssue: (...args) => applied.push(args),
    byRepository: { [repoId]: { issues: [current] } },
  };
  const { useIssue } = load("src/hooks/useIssue.ts", {
    "@/constants": { SOCKET_EVENTS: { issueUpdated: "updated", issueCreated: "created" } },
    "@/stores/issues.store": { useIssuesStore: (select) => select(store) },
    "./useAsync": {
      useAsync: () => ({
        data: current,
        loading: false,
        error: null,
        reload: () => {
          reloads++;
        },
      }),
    },
    "./useRepoRoom": { useRepoRoom: () => {} },
    "./useSocketEvent": { useSocketEvent: (event, callback) => listeners.set(event, callback) },
  });
  const detail = useIssue(repoId, firstId);
  listeners.get("updated")({ repoId: "unrelated", issue: issue(secondId) });
  assert.equal(reloads, 0);
  listeners.get("updated")({ repoId, issue: issue(secondId) });
  assert.equal(reloads, 1);
  listeners.get("created")({ repoId, issue: issue("child") });
  assert.equal(reloads, 2);
  listeners.get("updated")({ repoId, issue: current });
  assert.equal(reloads, 2);
  assert.equal(applied.length, 3);
  assert.equal(detail.issue, current);
});
