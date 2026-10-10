import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils";
import { fieldClassName } from "./fieldStyles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium">
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
