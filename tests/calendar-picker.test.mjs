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
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
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
const calendar = load("src/utils/calendar.ts");
const worklog = load("src/utils/worklog.ts");
const dates = load("src/utils/formatDate.ts");

test("shared display format is DD/MM/YY while stored dates keep a four-digit year", () => {
  assert.equal(dates.formatDate("2026-11-15"), "15/11/26");
  assert.equal(dates.formatDateRange("2026-11-01", "2026-11-15"), "01/11/26 – 15/11/26");
  assert.match(dates.formatDateTime(new Date(2026, 10, 15, 12).toISOString()), /15\/11\/26/);
  assert.equal(calendar.calendarDateValue(calendar.parseCalendarDate("2026-11-15")), "2026-11-15");
});
test("calendar civil dates round-trip without UTC conversion in different browser zones", () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of [
      "UTC",
      "America/Los_Angeles",
      "Pacific/Kiritimati",
      "Asia/Ho_Chi_Minh",
    ]) {
      process.env.TZ = timezone;
      const date = calendar.parseCalendarDate("2026-11-15");
      assert.equal(calendar.calendarDateValue(date), "2026-11-15", timezone);
      assert.equal(calendar.replaceCalendarDay("", date), "2026-11-15", timezone);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
test("calendar rejects impossible dates while supporting leap days and clearing", () => {
  for (const value of ["2026-02-30", "2025-02-29", "2026-13-01", "not-a-date", ""])
    assert.equal(calendar.parseCalendarDate(value), undefined);
  assert.equal(calendar.calendarDateValue(calendar.parseCalendarDate("2024-02-29")), "2024-02-29");
  assert.equal(calendar.formatCalendarValue(""), "");
  assert.equal(calendar.formatCalendarValue("2026-11-15"), "15/11/26");
  assert.equal(calendar.formatCalendarValue("2026-11-15T09:30", true), "15/11/26 · 09:30");
});
test("worklog day selection preserves seconds and milliseconds", () => {
  const value = "2026-11-15T09:30:45.123";
  const next = calendar.replaceCalendarDay(value, calendar.parseCalendarDate("2026-11-14"), true);
  assert.equal(next, "2026-11-14T09:30:45.123");
  assert.equal(worklog.vietnamInputToIso(next), "2026-11-14T02:30:45.123Z");
});
test("new worklog day starts with an explicit time and time edits stay on the selected day", () => {
  const initial = calendar.replaceCalendarDay("", calendar.parseCalendarDate("2026-11-14"), true);
  assert.equal(initial, "2026-11-14T00:00");
  assert.equal(calendar.replaceCalendarTime(initial, "23:15:30"), "2026-11-14T23:15:30");
  assert.equal(calendar.replaceCalendarTime("", "10:00"), "");
});
test("calendar date bounds do not discard timezone-specific worklog validation", () => {
  const date = calendar.parseCalendarDate("2026-11-14");
  const start = calendar.replaceCalendarDay("2026-11-15T23:00", date, true);
  const end = calendar.replaceCalendarDay("2026-11-15T01:00", date, true);
  assert.throws(() => worklog.validateWorklogInput(start, end), /sau/);
  assert.throws(
    () => worklog.validateWorklogInput("2099-01-01T08:00", "2099-01-01T09:00"),
    /quá khứ/,
  );
});
function pickerHarness({ withTime = false, ...props } = {}) {
  const calls = [];
  const Calendar = () => null,
    Button = () => null,
    Input = () => null;
  const { DatePicker, DateTimePicker } = load("src/components/ui/DatePicker.tsx", {
    react: { useId: () => "calendar", useState: () => [false, () => {}] },
    "./Calendar": { Calendar },
    "./Button": { Button },
    "./Input": { Input },
    "./Popover": { Popover: () => null, PopoverContent: () => null, PopoverTrigger: () => null },
    "@/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  });
  const element = (withTime ? DateTimePicker : DatePicker)({
    label: "Ngày",
    value: "",
    onChange: (value) => calls.push(value),
    ...props,
  });
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    nodes.push(node);
    walk(node.props?.children);
  }
  walk(element.type(element.props));
  return { calls, nodes, Calendar, Button, Input };
}
test("date picker emits the existing YYYY-MM-DD contract, not an ISO timestamp", () => {
  const picker = pickerHarness({ value: "2026-11-13", name: "startDate" });
  picker.nodes
    .find((n) => n.type === picker.Calendar)
    .props.onSelect(calendar.parseCalendarDate("2026-11-15"));
  assert.deepEqual(picker.calls, ["2026-11-15"]);
  const hidden = picker.nodes.find((n) => n.type === "input" && n.props.type === "hidden");
  assert.equal(hidden.props.name, "startDate");
  assert.equal(hidden.props.value, "2026-11-13");
});
test("optional issue dates can be cleared while required worklog fields cannot", () => {
  const optional = pickerHarness({ value: "2026-11-15" });
  optional.nodes
    .find((n) => n.type === optional.Button && n.props.children === "Xóa ngày")
    .props.onClick();
  assert.deepEqual(optional.calls, [""]);
  const required = pickerHarness({ withTime: true, required: true, value: "2026-11-15T10:00" });
  assert.equal(
    required.nodes.some((n) => n.type === required.Button && n.props.children === "Xóa ngày"),
    false,
  );
});
test("worklog picker keeps datetime values separate from calendar-only issue values", () => {
  const picker = pickerHarness({
    withTime: true,
    required: true,
    value: "2026-11-15T10:00:45.123",
  });
  picker.nodes
    .find((n) => n.type === picker.Calendar)
    .props.onSelect(calendar.parseCalendarDate("2026-11-14"));
  assert.deepEqual(picker.calls, ["2026-11-14T10:00:45.123"]);
  const time = picker.nodes.find((n) => n.type === picker.Input && n.props.type === "time");
  assert.equal(time.props.value, "10:00:45.123");
  time.props.onChange({ target: { value: "11:00" } });
  assert.equal(picker.calls[1], "2026-11-15T11:00");
});
test("calendar applies issue date limits and worklog future-day limits", () => {
  const picker = pickerHarness({ min: "2026-11-01", max: "2026-11-15T12:00" });
  const bounds = picker.nodes.find((n) => n.type === picker.Calendar).props.disabled;
  assert.equal(calendar.calendarDateValue(bounds[0].before), "2026-11-01");
  assert.equal(calendar.calendarDateValue(bounds[1].after), "2026-11-15");
});
