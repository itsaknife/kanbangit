"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils";
export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}
interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  onChange?: (value: string) => void;
}
export function Select({
  label,
  options,
  value,
  defaultValue,
  name,
  id,
  disabled,
  className,
  onChange,
  ...props
}: SelectProps) {
  const selectId = id ?? name;
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        {name && <input type="hidden" name={name} value={value ?? defaultValue ?? ""} />}
        <SelectPrimitive.Trigger
          id={selectId}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-full border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          aria-label={props["aria-label"]}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.icon}
            <SelectPrimitive.Value placeholder={selectedOption?.label} />
          </span>
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  {option.icon}
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
