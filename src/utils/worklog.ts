export function formatDuration(minutes: number | null) {
  if (minutes === null) return "Chưa có quyền xem";
  const seconds = Math.round(minutes * 60),
    hours = Math.floor(seconds / 3600),
    remaining = Math.floor((seconds % 3600) / 60),
    lastSeconds = seconds % 60;
  if (!seconds) return "0 phút";
  if (seconds < 60) return `${seconds} giây`;
  return [
    hours ? `${hours} giờ` : "",
    remaining ? `${remaining} phút` : "",
    lastSeconds ? `${lastSeconds} giây` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
export function vietnamDateTimeInput(iso: string) {
  return new Date(new Date(iso).getTime() + 7 * 3600000)
    .toISOString()
    .slice(0, 23)
    .replace(/\.000$/, "");
}
export function vietnamInputToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(value))
    throw new Error("Nhập đủ ngày và giờ");
  const normalized =
    value.length === 16 ? value + ":00" : value.includes(".") ? value.padEnd(23, "0") : value;
  const date = new Date(normalized + "+07:00");
  if (
    !Number.isFinite(+date) ||
    vietnamDateTimeInput(date.toISOString()) !== normalized.replace(/\.000$/, "")
  )
    throw new Error("Ngày giờ không hợp lệ");
  return date.toISOString();
}
export function validateWorklogInput(start: string, end: string, now = Date.now()) {
  const startAt = vietnamInputToIso(start),
    endAt = vietnamInputToIso(end);
  if (+new Date(endAt) <= +new Date(startAt)) throw new Error("Kết thúc phải sau bắt đầu");
  if (+new Date(endAt) > now || +new Date(startAt) > now)
    throw new Error("Chỉ được ghi nhận thời gian trong quá khứ");
  return { startAt, endAt };
}
export function worklogInputMinutes(start: string, end: string) {
  try {
    return (+new Date(vietnamInputToIso(end)) - +new Date(vietnamInputToIso(start))) / 60000;
  } catch {
    return null;
  }
}
export function displayMentionContent(content: string) {
  return content.replace(/\[(@[^\]\r\n]{1,100})\]\(mention:[0-9a-f-]{36}\)/gi, "**$1**");
}
