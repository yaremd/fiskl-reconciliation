"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getInvoice,
  saveInvoice,
  deleteInvoices,
  generateInvoiceId,
  generateInvoiceNumber,
  generateShareToken,
} from "@/lib/invoices/invoice-store";
import type { Invoice } from "@/types/invoices";
import { Separator } from "@/components/ui/separator";
import { InvoicePreview } from "./invoice-preview";
import { InvoiceEditSection } from "./invoice-edit-section";
import { InvoiceActionBar } from "./invoice-action-bar";

interface InvoiceEditorProps {
  id?: string; // undefined = new invoice
}

function today() {
  return new Date().toISOString().split("T")[0];
}
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

function emptyInvoice(): Invoice {
  return {
    id: generateInvoiceId(),
    number: generateInvoiceNumber(),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    currency: "USD",
    issueDate: today(),
    dueDate: defaultDueDate(),
    saleDate: today(),
    lineItems: [],
    discountPercent: 0,
    notes: "",
    status: "Open",
    payments: [],
    history: [
      {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: "Invoice created",
        by: "You",
      },
    ],
    schedule: null,
    emailSubject: "",
    emailMessage: "Please find attached your invoice. Let us know if you have any questions.",
    overdueReminders: [],
    shareToken: generateShareToken(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function InvoiceEditor({ id }: InvoiceEditorProps) {
  const router = useRouter();
  const isNew = !id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  // Resizable panel state
  const [leftPct, setLeftPct] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) {
      const inv = emptyInvoice();
      setInvoice(inv);
      setSavedInvoice(inv);
    } else {
      const inv = getInvoice(id);
      if (!inv) {
        router.replace("/invoices");
        return;
      }
      setInvoice(inv);
      setSavedInvoice(inv);
    }
  }, [id, isNew, router]);

  const hasUnsaved = invoice !== null && savedInvoice !== null &&
    JSON.stringify(invoice) !== JSON.stringify(savedInvoice);

  const handleChange = useCallback((patch: Partial<Invoice>) => {
    setInvoice((prev) => prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev);
  }, []);

  function handleSave(overrides?: Partial<Invoice>) {
    if (!invoice) return;
    setSaving(true);
    const toSave = { ...invoice, ...overrides, updatedAt: new Date().toISOString() };
    saveInvoice(toSave);
    setInvoice(toSave);
    setSavedInvoice(toSave);
    setSaving(false);
    if (isNew) {
      router.replace(`/invoices/${toSave.id}/edit`);
    }
  }

  function handleSend() {
    if (!invoice) return;
    const newHistory = [
      ...invoice.history,
      {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: `Invoice sent to ${invoice.clientEmail || "client"}`,
        by: "You",
      },
    ];
    handleSave({ status: "Sent", history: newHistory });
  }

  function handleDelete() {
    if (!invoice) return;
    deleteInvoices([invoice.id]);
    router.push("/invoices");
  }

  // Drag resize
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(e: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(30, pct)));
    }
    function onUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  if (!invoice) return null;

  // 56px header + 61px action bar
  const SPLIT_HEIGHT = "calc(100dvh - 56px - 61px)";

  return (
    <div className="flex flex-col -m-6">
      {/* Split panel */}
      <div
        ref={containerRef}
        className="flex overflow-hidden"
        style={{ height: SPLIT_HEIGHT }}
      >
        {/* Left: editor */}
        <div style={{ width: `${leftPct}%` }} className="min-w-0 overflow-y-auto bg-background">
          <div className="p-4">
            <InvoiceEditSection
              invoice={invoice}
              isNew={isNew}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Drag handle — separator always visible, grip only on hover */}
        <div
          onMouseDown={onMouseDown}
          className="group relative w-4 shrink-0 cursor-col-resize flex items-center justify-center"
        >
          <Separator orientation="vertical" className="h-full" />
          <div className="absolute flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
          </div>
        </div>

        {/* Right: preview — fixed, non-scrolling */}
        <div style={{ width: `${100 - leftPct}%` }} className="min-w-0 h-full overflow-hidden sticky top-0">
          <InvoicePreview invoice={invoice} />
        </div>
      </div>

      {/* Action bar */}
      <InvoiceActionBar
        invoice={invoice}
        isNew={isNew}
        hasUnsaved={hasUnsaved}
        saving={saving}
        onBack={() => router.push("/invoices")}
        onSave={() => handleSave()}
        onSend={handleSend}
        onDelete={handleDelete}
      />
    </div>
  );
}
