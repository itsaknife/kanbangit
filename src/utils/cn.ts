type ClassValue = string | false | null | undefined;

/** Ghép các class Tailwind lại với nhau, bỏ qua giá trị rỗng/false. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
