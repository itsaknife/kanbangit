type ClassValue = string | false | null | undefined | ClassValue[];

/** Ghép các class Tailwind lại với nhau, bỏ qua giá trị rỗng/false. */
export function cn(...classes: ClassValue[]): string {
  return classes
    .reduce<string[]>((result, value) => {
      if (Array.isArray(value)) return result.concat(cn(...value).split(" ").filter(Boolean));
      if (value) result.push(value);
      return result;
    }, [])
    .join(" ");
}
