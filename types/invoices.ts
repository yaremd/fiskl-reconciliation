export type InvoiceStatus = "Open" | "Sent" | "Overdue" | "Partial" | "Paid" | "Rejected";

export const INVOICE_STATUSES: InvoiceStatus[] = ["Open", "Sent", "Overdue", "Partial", "Paid", "Rejected"];

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
};

export const TAX_RATES = [0, 5, 10, 20] as const;

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface Invoice {
  id: string;
  number: string; // INV-001
  clientName: string;
  clientEmail: string;
  currency: Currency;
  issueDate: string; // ISO date YYYY-MM-DD
  dueDate: string;
  lineItems: InvoiceLineItem[];
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
}

// Derived totals helper
export function calcInvoiceTotals(lineItems: InvoiceLineItem[]) {
  let subtotal = 0;
  let taxTotal = 0;
  for (const item of lineItems) {
    const lineSubtotal = item.quantity * item.unitPrice;
    subtotal += lineSubtotal;
    taxTotal += lineSubtotal * (item.taxRate / 100);
  }
  return { subtotal, taxTotal, total: subtotal + taxTotal };
}
