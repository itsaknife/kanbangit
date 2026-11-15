import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils";
import { fieldClassName, fieldLayoutClassName, type LabelLayout } from "./fieldStyles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelLayout?: LabelLayout;
}

export function Input({ label, labelLayout, error, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={fieldLayoutClassName(labelLayout)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(fieldClassName, error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
