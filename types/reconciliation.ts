// ─── Account / Period ───────────────────────────────────────────────────────

export type MonthStatus =
  | "reconciled"
  | "needs_attention"
  | "in_progress"
  | "draft"
  | null;

export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number | null;
  months: MonthStatus[];
}

export interface Period {
  period: string;
  status: MonthStatus;
  balance: number;
}

// ─── Transactions (Screen 1) ─────────────────────────────────────────────────

export interface Transaction {
  id: string;
  d: string;
  n: string;
  aiConf: number | null;
  cat: string;
  catType: "expense" | "income" | null;
  isManual: boolean;
  tax: number | null;
  amount: number;
  currency: string;
  amountGbp: number;
  hasLink: boolean;
  extraCats: number;
}

// ─── Reconciliation items (Screen 3) ────────────────────────────────────────

export interface LedgerEntry {
  d: string;
  n: string;
  a: number;
  cat?: string;
}

export interface StatementEntry {
  d: string;
  n: string;
  a: number;
}

export type AttentionItemType =
  | "Date offset"
  | "Name variant"
  | "one-to-many"
  | "missing-in-bank"
  | "Duplicate"
  | string;

export interface AttentionItem {
  id: string;
  type: AttentionItemType;
  L: LedgerEntry | null;
  R: StatementEntry | null;
  conf: number | null;
  ex: string | null;
  at: "accept" | null;
  aiSuggested: boolean;
  ledgerItems?: LedgerEntry[];
  candidates?: LedgerEntry[];
}

export interface MatchedItem {
  id: string;
  L: LedgerEntry;
  R: StatementEntry;
  conf: number;
}

export interface LedgerRow {
  id: string;
  d: string;
  n: string;
  a: number;
  cat: string;
  st: "reconciled" | "unreconciled";
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

export interface NavSubItem {
  id: string;
  label: string;
  url: string;
  active?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  url: string;
  sub?: NavSubItem[];
}
