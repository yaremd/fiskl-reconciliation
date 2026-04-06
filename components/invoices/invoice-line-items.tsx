"use client";

import { PlusCircle, Trash2, GripVertical, Package, Zap, Clock, Car, CreditCard, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  calcLineItem,
  LINE_ITEM_TYPES,
  LINE_ITEM_UNIT,
  LINE_ITEM_TYPE_COLORS,
  fmtCurrency,
} from "@/types/invoices";
import type { InvoiceLineItem, LineItemType } from "@/types/invoices";
import * as React from "react";

const TYPE_ICON: Record<LineItemType, React.ReactNode> = {
  Product: <Package className="h-4 w-4" />,
  Service: <Zap className="h-4 w-4" />,
  Time:    <Clock className="h-4 w-4" />,
  Mileage: <Car className="h-4 w-4" />,
  Expense: <CreditCard className="h-4 w-4" />,
};

const TYPE_CHIP_COLORS: Record<LineItemType, string> = {
  Product: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  Service: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  Time:    "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  Mileage: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  Expense: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
};

const TYPE_OPTION_HOVER: Record<LineItemType, string> = {
  Product: "hover:bg-blue-50 hover:text-blue-700",
  Service: "hover:bg-purple-50 hover:text-purple-700",
  Time:    "hover:bg-green-50 hover:text-green-700",
  Mileage: "hover:bg-orange-50 hover:text-orange-700",
  Expense: "hover:bg-red-50 hover:text-red-700",
};

function TypeChip({ value, onChange }: { value: LineItemType; onChange: (t: LineItemType) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 px-2 h-9 rounded-md border text-sm font-semibold transition-colors cursor-pointer w-full justify-between",
            TYPE_CHIP_COLORS[value]
          )}
        >
          <span className="flex items-center gap-1.5">
            {TYPE_ICON[value]}
            {value}
          </span>
          <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start" sideOffset={4}>
        {LINE_ITEM_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { onChange(t); setOpen(false); }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium text-foreground transition-colors",
              TYPE_OPTION_HOVER[t],
              t === value && "bg-muted"
            )}
          >
            <span className={cn("flex items-center justify-center w-5 h-5 rounded", LINE_ITEM_TYPE_COLORS[t])}>
              {TYPE_ICON[t]}
            </span>
            {t}
            {t === value && <Check className="h-3 w-3 ml-auto opacity-60" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

interface InvoiceLineItemsProps {
  items: InvoiceLineItem[];
  currency: string;
  onChange: (items: InvoiceLineItem[]) => void;
}

const TAX_RATES = [0, 5, 10, 20, 25];

const LINE_ITEM_ACCENT: Record<LineItemType, string> = {
  Product: "border-l-blue-400",
  Service: "border-l-purple-400",
  Time:    "border-l-green-400",
  Mileage: "border-l-orange-400",
  Expense: "border-l-red-400",
};

function newItem(): Omit<InvoiceLineItem, "subtotal" | "taxAmount" | "total"> {
  return {
    id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "Service",
    name: "",
    note: "",
    quantity: 1,
    unit: "units",
    price: 0,
    taxRate: 0,
  };
}

export function InvoiceLineItems({ items, currency, onChange }: InvoiceLineItemsProps) {
  function updateItem(id: string, patch: Partial<InvoiceLineItem>) {
    onChange(
      items.map((it) => {
        if (it.id !== id) return it;
        const merged = { ...it, ...patch };
        return calcLineItem(merged);
      })
    );
  }

  function changeType(id: string, type: LineItemType) {
    const unit = LINE_ITEM_UNIT[type];
    updateItem(id, { type, unit });
  }

  function addItem() {
    const raw = newItem();
    onChange([...items, calcLineItem(raw)]);
  }

  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  const totalSum = items.reduce((s, it) => s + it.total, 0);

  return (
    <div className="space-y-2">
      {/* Column headers */}
      {items.length > 0 && (
        <div className="grid gap-1 px-1" style={{ gridTemplateColumns: "16px 120px 1fr 90px 90px 90px 90px 28px" }}>
          {["", "Type", "Item / Description", "Qty", "Price", "Tax", "Total", ""].map((h, i) => (
            <div
              key={i}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                i >= 3 && "text-right"
              )}
            >
              {h}
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg bg-muted/20 p-2 space-y-1.5"
        >
          {/* Row 1: type + name + qty + price + tax + total + delete */}
          <div className="grid gap-1 items-center" style={{ gridTemplateColumns: "16px 120px 1fr 90px 90px 90px 90px 28px" }}>
            {/* Drag handle placeholder */}
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />

            {/* Type */}
            <TypeChip value={item.type} onChange={(t) => changeType(item.id, t)} />

            {/* Name */}
            <Input
              value={item.name}
              onChange={(e) => updateItem(item.id, { name: e.target.value })}
              placeholder={item.type === "Time" ? "Service description" : item.type === "Mileage" ? "Trip description" : item.type === "Expense" ? "Expense description" : "Item name"}
            />

            {/* Qty */}
            <div className="relative">
              <Input
                type="number"
                min={item.type === "Expense" ? 1 : 0}
                step="any"
                value={item.quantity}
                disabled={item.type === "Expense"}
                onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                className="pr-6 tabular-nums"
              />
              {item.unit && (
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                  {item.unit}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : ""}
              </span>
              <Input
                type="number"
                min={0}
                step="any"
                value={item.price}
                onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                className="pl-5 tabular-nums"
              />
            </div>

            {/* Tax */}
            <Select
              value={String(item.taxRate)}
              onValueChange={(v) => updateItem(item.id, { taxRate: parseFloat(v) })}
            >
              <SelectTrigger className="px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_RATES.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Total */}
            <div className="text-right text-xs font-medium tabular-nums pr-1">
              {fmtCurrency(item.total, currency)}
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="flex items-center justify-center w-10 h-10 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Row 2: note */}
          <div className="pl-[calc(16px+110px+4px+4px)]">
            <Input
              value={item.note}
              onChange={(e) => updateItem(item.id, { note: e.target.value })}
              placeholder="Note (optional)"
              className="bg-transparent border-transparent hover:border-border focus:border-border transition-colors"
            />
          </div>
        </div>
      ))}

      {/* Add item + total row */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add line item
        </button>
        {items.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Subtotal:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {fmtCurrency(totalSum, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
