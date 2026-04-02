export type InvoiceStatus = "Open" | "Sent" | "Overdue" | "Partial" | "Paid" | "Rejected";
export type LineItemType = "Product" | "Service" | "Time" | "Mileage" | "Expense";
export type RecurringPeriod = "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type PaymentMethod = "Bank Transfer" | "Card" | "Cash" | "PayPal" | "Other";

export const INVOICE_STATUSES: InvoiceStatus[] = ["Open", "Sent", "Overdue", "Partial", "Paid", "Rejected"];
export const LINE_ITEM_TYPES: LineItemType[] = ["Product", "Service", "Time", "Mileage", "Expense"];
export const RECURRING_PERIODS: RecurringPeriod[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];
export const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "Card", "Cash", "PayPal", "Other"];

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "HKD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", SGD: "S$", HKD: "HK$",
};

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Open:     "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
  Sent:     "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900",
  Overdue:  "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  Partial:  "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
  Paid:     "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
  Rejected: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-900",
};

export const LINE_ITEM_TYPE_COLORS: Record<LineItemType, string> = {
  Product:  "bg-blue-100 text-blue-700",
  Service:  "bg-purple-100 text-purple-700",
  Time:     "bg-green-100 text-green-700",
  Mileage:  "bg-orange-100 text-orange-700",
  Expense:  "bg-red-100 text-red-700",
};

export const LINE_ITEM_UNIT: Record<LineItemType, string> = {
  Product: "units",
  Service: "units",
  Time: "hrs",
  Mileage: "mi",
  Expense: "item",
};

export interface InvoiceLineItem {
  id: string;
  type: LineItemType;
  name: string;
  note: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: PaymentMethod;
  note: string;
  status: "Paid" | "Pending" | "Failed";
  createdAt: string;
}

export interface InvoiceHistoryEntry {
  id: string;
  date: string;
  action: string;
  by: string;
}

export interface InvoiceSchedule {
  every: number;
  period: RecurringPeriod;
  remaining: number;
  endDate: string | null;
  autoSend: boolean;
  status: "Scheduled" | "Paused";
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  saleDate: string;
  lineItems: InvoiceLineItem[];
  discountPercent: number;
  notes: string;
  status: InvoiceStatus;
  payments: InvoicePayment[];
  history: InvoiceHistoryEntry[];
  schedule: InvoiceSchedule | null;
  emailSubject: string;
  emailMessage: string;
  overdueReminders: number[];
  shareToken: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcLineItem(
  item: Omit<InvoiceLineItem, "subtotal" | "taxAmount" | "total">
): InvoiceLineItem {
  const subtotal = item.quantity * item.price;
  const taxAmount = subtotal * (item.taxRate / 100);
  return { ...item, subtotal, taxAmount, total: subtotal + taxAmount };
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export function calcInvoiceTotals(
  invoice: Pick<Invoice, "lineItems" | "discountPercent">
): InvoiceTotals {
  let subtotal = 0;
  let taxAmount = 0;
  for (const item of invoice.lineItems) {
    subtotal += item.subtotal;
    taxAmount += item.taxAmount;
  }
  const discountAmount = subtotal * (invoice.discountPercent / 100);
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

export function calcAmountDue(invoice: Invoice): number {
  const { total } = calcInvoiceTotals(invoice);
  const paid = invoice.payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, total - paid);
}

export function fmtCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
