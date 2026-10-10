import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils";
import { fieldClassName } from "./fieldStyles";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({ label, options, id, className, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <select id={selectId} className={cn(fieldClassName, className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
