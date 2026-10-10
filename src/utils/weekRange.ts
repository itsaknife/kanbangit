import { parseDate } from "./formatDate";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Date -> "yyyy-MM-dd" theo giờ địa phương. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Ngày thứ Hai của tuần chứa `date`, định dạng "yyyy-MM-dd". */
export function getWeekStart(date: Date = new Date()): string {
  const daysFromMonday = (date.getDay() + 6) % 7;
  return toDateString(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysFromMonday),
  );
}

/** Dịch tuần đi `offset` tuần (âm là lùi lại). */
export function addWeeks(weekStart: string, offset: number): string {
  const date = parseDate(weekStart);
  return toDateString(new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset * 7));
}
