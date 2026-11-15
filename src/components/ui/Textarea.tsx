import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils";
import { fieldClassName, fieldLayoutClassName, type LabelLayout } from "./fieldStyles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  labelLayout?: LabelLayout;
}

export function Textarea({ label, labelLayout, error, id, className, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className={fieldLayoutClassName(labelLayout)}>
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "text-sm font-medium",
            labelLayout === "horizontal" && "self-start sm:pt-2",
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(fieldClassName, error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
