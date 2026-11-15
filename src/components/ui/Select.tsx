"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/utils";
import { fieldLayoutClassName, type LabelLayout } from "./fieldStyles";
export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}
interface SelectProps {
  label?: string;
  labelLayout?: LabelLayout;
  appearance?: "field" | "pill" | "subtle";
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  onChange?: (value: string) => void;
}
export function Select({
  label,
  labelLayout,
  appearance = "field",
  options,
  value,
  defaultValue,
  name,
  id,
  disabled,
  className,
  placeholder = "Chọn một giá trị",
  onChange,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === currentValue);
  // Radix reserves the empty string for clearing a selection.
  const emptyValue = `${generatedId}-empty`;
  return (
    <div className={fieldLayoutClassName(appearance === "pill" ? "vertical" : labelLayout)}>
      {label && (
        <label
          htmlFor={selectId}
          className={appearance === "pill" ? "sr-only" : "text-sm font-medium"}
        >
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={currentValue === "" && selectedOption ? emptyValue : currentValue}
        onValueChange={(next) => {
          const normalized = next === emptyValue ? "" : next;
          setInternalValue(normalized);
          onChange?.(normalized);
        }}
        disabled={disabled}
      >
        {name && <input type="hidden" name={name} value={currentValue} disabled={disabled} />}
        <SelectPrimitive.Trigger
          id={selectId}
          className={cn(
            "flex min-w-0 max-w-full items-center justify-between text-left outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-ring disabled:cursor-not-allowed disabled:opacity-50",
            appearance === "pill"
              ? "h-8 max-w-[15rem] gap-2 rounded-full border border-input bg-muted/30 px-3 text-xs"
              : appearance === "subtle"
                ? "h-9 w-full gap-2 rounded-md border-0 bg-transparent px-2 text-sm"
                : "h-10 w-full gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
            className,
          )}
          aria-label={props["aria-label"]}
          title={selectedOption?.label ?? label}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <SelectPrimitive.Value className="flex min-w-0 flex-1" placeholder={placeholder}>
              {selectedOption && (
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                  <span className="truncate">{selectedOption.label}</span>
                </span>
              )}
            </SelectPrimitive.Value>
          </span>
          <SelectPrimitive.Icon className="shrink-0">
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            align="start"
            className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
          >
            <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center bg-popover">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="max-h-72 p-1">
              <SelectPrimitive.Group>
                {label && (
                  <SelectPrimitive.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {label}
                  </SelectPrimitive.Label>
                )}
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value === "" ? emptyValue : option.value}
                    disabled={option.disabled}
                    textValue={option.label}
                    className="relative flex cursor-default select-none items-center gap-2.5 rounded-md py-2 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent/60 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    {option.icon}
                    <span className="min-w-0 flex-1">
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                      {option.description && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center bg-popover">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
