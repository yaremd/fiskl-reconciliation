import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as GBP currency string, e.g. £1,234.56 */
export function fmtGbp(n: number, signed?: boolean): string {
  const abs = "£" + Math.abs(n).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!signed) return (n < 0 ? "−" : "") + abs;
  return (n >= 0 ? "+" : "−") + abs;
}

/** Format a number in any supported currency */
export function fmtCurrency(n: number | null | undefined, currency: string): string {
  if (n == null) return "—";
  const sym: Record<string, string> = { GBP: "£", EUR: "€", USD: "$" };
  const s = sym[currency] || "";
  return s + Math.abs(n).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a signed amount with currency symbol */
export function fmtAmt(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "—";
  const sym: Record<string, string> = { GBP: "£", EUR: "€", USD: "$" };
  const s = sym[currency] || "";
  const abs = Math.abs(amount).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (amount < 0 ? "-" : "") + s + abs;
}

/** Brand gradient used across the app */
export const BRAND_GRADIENT =
  "linear-gradient(92deg,#0058FF 0%,#00B4FF 45%,#00E0A0 100%)";

/** Convert a period string like "June 2025" to a URL slug "june-2025" */
export function periodSlug(period: string): string {
  return period.toLowerCase().replace(/\s+/g, "-");
}
