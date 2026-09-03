import { Command } from "cmdk";
import { useState } from "react";
import { Check, ChevronDown, Search } from "@zatgo/icons";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./lib/cn";

export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string;
  disabled?: boolean;
  /** Optional muted second line rendered under the label (e.g. an account's root type). */
  description?: string;
};

/** Searchable, filterable single-select — drop-in replacement for a plain
 * <select> wherever the option list can get long (accounts, parties, items). */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("truncate text-left", !selected && "text-[var(--color-muted-foreground)]")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[var(--color-muted-foreground)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
            <Search className="size-4 shrink-0 text-[var(--color-muted-foreground)]" />
            <Command.Input
              autoFocus
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted-foreground)]"
            />
          </div>
          <Command.List className="max-h-64 overflow-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
              {emptyText}
            </Command.Empty>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={`${opt.label} ${opt.keywords ?? ""}`}
                disabled={opt.disabled}
                onSelect={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-start gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm aria-selected:bg-[var(--color-accent)] aria-selected:text-[var(--color-accent-foreground)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
              >
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    opt.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{opt.label}</span>
                  {opt.description ? (
                    <span className="truncate text-xs text-[var(--color-muted-foreground)]">
                      {opt.description}
                    </span>
                  ) : null}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
