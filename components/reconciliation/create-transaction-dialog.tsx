"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Transaction } from "@/types/reconciliation";

interface CreateTransactionDialogProps {
  direction: "in" | "out";
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id" | "hasLink" | "extraCats" | "amountGbp">) => void;
}

export function CreateTransactionDialog({ direction, open, onClose, onSave }: CreateTransactionDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ n: "", d: today, amount: "", currency: "GBP", cat: "", tax: "" });
  const isIn = direction === "in";

  function upd(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function handleSave() {
    if (!form.n || !form.amount) return;
    const rawAmt = parseFloat(form.amount) || 0;
    onSave({
      d: form.d.split("-").reverse().join("/"),
      n: form.n,
      aiConf: null,
      cat: form.cat || (isIn ? "Uncategorized Income" : "Uncategorized Expense"),
      catType: form.cat ? null : (isIn ? "income" : "expense"),
      isManual: true,
      tax: form.tax ? parseFloat(form.tax) : null,
      amount: isIn ? rawAmt : -rawAmt,
      currency: form.currency,
    });
    onClose();
  }

  const currencySymbol: Record<string, string> = { GBP: "£", EUR: "€", USD: "$" };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isIn ? "rgba(0,232,157,.12)" : "rgba(255,39,95,.08)",
                border: `1px solid ${isIn ? "rgba(0,232,157,.35)" : "rgba(255,39,95,.25)"}`,
                color: isIn ? "var(--positive)" : "var(--destructive)",
              }}
            >
              {isIn ? <Plus size={14} /> : <Minus size={14} />}
            </div>
            <DialogTitle>New {isIn ? "Income" : "Expense"}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Description</label>
            <Input autoFocus placeholder="e.g. Office supplies" value={form.n} onChange={e => upd("n", e.target.value)} selectAllOnFocus={false} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Date</label>
              <Input type="date" value={form.d} onChange={e => upd("d", e.target.value)} selectAllOnFocus={false} />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Currency</label>
              <select
                value={form.currency}
                onChange={e => upd("currency", e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors cursor-pointer"
              >
                {["GBP","EUR","USD"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[13px] font-medium text-muted-foreground select-none">
                {currencySymbol[form.currency] || ""}
              </span>
              <Input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => upd("amount", e.target.value)}
                className="pl-6"
                selectAllOnFocus={false}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Category</label>
              <Input placeholder="e.g. Sales Revenue" value={form.cat} onChange={e => upd("cat", e.target.value)} selectAllOnFocus={false} />
            </div>
            <div className="w-[90px]">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">Tax %</label>
              <Input type="number" min="0" max="100" placeholder="0" value={form.tax} onChange={e => upd("tax", e.target.value)} selectAllOnFocus={false} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            Add {isIn ? "Income" : "Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
