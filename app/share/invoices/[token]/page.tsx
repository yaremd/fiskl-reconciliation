"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Invoice } from "@/types/invoices";
import { getInvoiceByToken } from "@/lib/invoices/invoice-store";
import { InvoiceShareView } from "@/components/invoices/invoice-share-view";

export default function ShareInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => {
    setInvoice(getInvoiceByToken(token));
  }, [token]);

  if (invoice === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (invoice === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-800">Invoice not found</p>
          <p className="text-sm text-gray-500">This link may be invalid or the invoice has been removed.</p>
        </div>
      </div>
    );
  }

  return <InvoiceShareView invoice={invoice} />;
}
