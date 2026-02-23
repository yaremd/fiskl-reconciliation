"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LedgerEntry } from "@/types/reconciliation";

interface EditTransactionDialogProps {
  tx: LedgerEntry & { id?: string };
  open: boolean;
  onClose: () => void;
  onSave: (form: LedgerEntry) => void;
}

export function EditTransactionDialog({ tx, open, onClose, onSave }: EditTransactionDialogProps) {
  const [form, setForm] = useState<LedgerEntry>({ n: tx.n, a: tx.a, d: tx.d, cat: tx.cat || "" });

  function upd<K extends keyof LedgerEntry>(k: K, v: LedgerEntry[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  const fields: Array<[string, keyof LedgerEntry, string]> = [
    ["Description", "n", "text"],
    ["Date", "d", "text"],
    ["Amount (£)", "a", "number"],
    ["Category", "cat", "text"],
  ];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          {fields.map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-[.04em]">
                {label}
              </label>
              <Input
                type={type}
                value={String(form[key] ?? "")}
                onChange={e =>
                  upd(key, type === "number" ? (parseFloat(e.target.value) || 0) as any : e.target.value as any)
                }
                selectAllOnFocus={false}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { onSave(form); onClose(); }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
