const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

/**
 * Chuyển chuỗi ngày thành Date.
 * Chuỗi chỉ có ngày (yyyy-MM-dd) được hiểu theo giờ địa phương để không bị lệch ngày.
 */
export function parseDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(parseDate(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(parseDate(value));
}

/** Ví dụ: "05/10". */
export function formatShortDate(value: string): string {
  return shortDateFormatter.format(parseDate(value));
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}
