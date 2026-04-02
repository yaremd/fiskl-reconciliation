import type { Invoice, InvoiceStatus } from "@/types/invoices";
import { MOCK_INVOICES } from "./mock-data";

const STORAGE_KEY = "fiskl_invoices_v2";

function seed(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INVOICES));
  }
}

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return MOCK_INVOICES;
  seed();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Invoice[];
  } catch {
    return MOCK_INVOICES;
  }
}

export function getInvoice(id: string): Invoice | null {
  return getInvoices().find((inv) => inv.id === id) ?? null;
}

export function saveInvoice(invoice: Invoice): void {
  const all = getInvoices();
  const idx = all.findIndex((inv) => inv.id === invoice.id);
  if (idx >= 0) {
    all[idx] = invoice;
  } else {
    all.unshift(invoice);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteInvoices(ids: string[]): void {
  const set = new Set(ids);
  const filtered = getInvoices().filter((inv) => !set.has(inv.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function bulkUpdateStatus(ids: string[], status: InvoiceStatus): void {
  const all = getInvoices().map((inv) =>
    ids.includes(inv.id)
      ? {
          ...inv,
          status,
          updatedAt: new Date().toISOString(),
          history: [
            ...inv.history,
            {
              id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
              date: new Date().toISOString(),
              action: `Status changed to ${status}`,
              by: "You",
            },
          ],
        }
      : inv
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function generateInvoiceId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateInvoiceNumber(): string {
  const all = getInvoices();
  const max = all.reduce((acc, inv) => {
    const n = parseInt(inv.number.replace("INV-", ""), 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

export function generateShareToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
