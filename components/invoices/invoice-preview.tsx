"use client";

import type { Invoice } from "@/types/invoices";
import { calcInvoiceTotals, fmtCurrency, LINE_ITEM_TYPE_COLORS, CURRENCY_SYMBOLS } from "@/types/invoices";

interface InvoicePreviewProps {
  invoice: Invoice;
  containerClassName?: string;
}

export function InvoicePreview({ invoice, containerClassName }: InvoicePreviewProps) {
  const totals = calcInvoiceTotals(invoice);
  const sym = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency + " ";

  function fmt(n: number) {
    return fmtCurrency(n, invoice.currency);
  }

  function fmtDate(d: string) {
    if (!d) return "—";
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch {
      return d;
    }
  }

  return (
    <div className={containerClassName ?? "h-full overflow-y-auto bg-muted"}>
      <div className="p-6">
      <div className="mx-auto rounded-xl border border-border bg-white shadow-lg text-[13px] text-gray-800 dark:bg-neutral-900 dark:text-neutral-200" style={{ maxWidth: "var(--invoice-doc-maxw, 48rem)", aspectRatio: "210/297" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-gray-100 dark:border-neutral-800">
          {/* Logo + company */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fiskl-mark.svg" alt="fiskl" className="w-9 h-9 flex-shrink-0" />
            <div>
              <div className="font-bold text-[15px] text-gray-900 dark:text-white">Fiskl Demo Co.</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">demo@fiskl.com</div>
            </div>
          </div>
          {/* Invoice label + number */}
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">INVOICE</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mt-0.5">{invoice.number || "DRAFT"}</div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Dates + Bill To */}
          <div className="flex gap-8">
            {/* Bill To */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1.5">
                Bill To
              </div>
              {invoice.clientName ? (
                <>
                  <div className="font-semibold text-gray-900 dark:text-white">{invoice.clientName}</div>
                  {invoice.clientEmail && (
                    <div className="text-xs text-gray-500 dark:text-neutral-400">{invoice.clientEmail}</div>
                  )}
                  {invoice.clientAddress && (
                    <div className="text-xs text-gray-500 dark:text-neutral-400 whitespace-pre-line mt-0.5">
                      {invoice.clientAddress}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 italic text-xs">No client selected</div>
              )}
            </div>
            {/* Dates */}
            <div className="shrink-0 space-y-2">
              {[
                { label: "Issue Date", value: fmtDate(invoice.issueDate) },
                { label: "Due Date",   value: fmtDate(invoice.dueDate) },
                ...(invoice.saleDate ? [{ label: "Sale Date", value: fmtDate(invoice.saleDate) }] : []),
              ].map((row) => (
                <div key={row.label} className="flex gap-4 items-baseline">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 w-20 text-right">
                    {row.label}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-neutral-200 text-right min-w-[90px]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          {invoice.lineItems.length > 0 ? (
            <div className="rounded-lg border border-gray-100 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-800/60">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Item
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Price
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Tax
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-neutral-800">
                      <td className="px-3 py-2.5">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${LINE_ITEM_TYPE_COLORS[item.type]}`}
                          >
                            {item.type}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-neutral-200">{item.name || "—"}</div>
                            {item.note && (
                              <div className="text-[11px] text-gray-400 dark:text-neutral-500">{item.note}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-neutral-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-neutral-300">
                        {fmt(item.price)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-500 dark:text-neutral-400">
                        {item.taxRate > 0 ? `${item.taxRate}%` : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-gray-800 dark:text-neutral-200">
                        {fmt(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 dark:border-neutral-700 p-6 text-center text-xs text-gray-400 dark:text-neutral-500">
              No line items yet
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(totals.subtotal)}</span>
              </div>
              {invoice.discountPercent > 0 && (
                <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                  <span>Discount ({invoice.discountPercent}%)</span>
                  <span className="tabular-nums">−{fmt(totals.discountAmount)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400">
                  <span>Tax</span>
                  <span className="tabular-nums">{fmt(totals.taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-neutral-700 pt-1.5 mt-1.5 flex justify-between font-bold text-[14px] text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="tabular-nums">{fmt(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">
                Notes
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-300 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 dark:border-neutral-800 text-center">
          <p className="text-[11px] text-gray-400 dark:text-neutral-500">
            Thank you for your business · {sym} {invoice.currency}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

