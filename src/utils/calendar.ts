/** Calendar values are civil dates, never UTC instants. */
export function parseCalendarDate(value?: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.slice(0, 10) ?? "");
  if (!match) return undefined;
  const [, year, month, day] = match;
  const result = new Date(0);
  result.setFullYear(Number(year), Number(month) - 1, Number(day));
  result.setHours(12, 0, 0, 0);
  return calendarDateValue(result) === match[0] ? result : undefined;
}
export function calendarDateValue(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
export function formatCalendarValue(value: string, withTime = false): string {
  if (!parseCalendarDate(value)) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  const date = day + "/" + month + "/" + year.slice(-2);
  return withTime && value.includes("T") ? date + " · " + value.slice(11) : date;
}
export function replaceCalendarDay(value: string, date: Date, withTime = false): string {
  const day = calendarDateValue(date);
  return withTime ? day + "T" + (value.split("T")[1] || "00:00") : day;
}
export function replaceCalendarTime(value: string, time: string): string {
  return parseCalendarDate(value) && time ? value.slice(0, 10) + "T" + time : value;
}
