"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: string;           // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  clearable,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = date && isValid(date) ? date : undefined;

  function handleSelect(selected: Date | undefined) {
    onChange(selected ? format(selected, "yyyy-MM-dd") : "");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !validDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1">{validDate ? format(validDate, "MMM d, yyyy") : <span>{placeholder}</span>}</span>
          {clearable && validDate && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="ml-1 rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={handleSelect}
          defaultMonth={validDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
