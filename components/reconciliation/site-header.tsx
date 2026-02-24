"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, Eye, EyeOff, Sun } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BRAND_GRADIENT } from "@/lib/utils";

interface SiteHeaderProps {
  accountId?: string;
  periodId?: string;
}

// The six workflow tabs mirror the original Vite screen tabs
const TABS = [
  { label: "Reconciliations list", href: "/reconciliation" },
  { label: "Account selected",     href: null }, // dynamic, filled by accountId
  { label: "Period selected",      href: null }, // dynamic
  { label: "Upload statement",     href: null },
  { label: "Reconcile",           href: null },
  { label: "Report",               href: null },
];

export function SiteHeader({ accountId, periodId }: SiteHeaderProps) {
  const [privacy, setPrivacy] = useState(false);
  const pathname = usePathname();

  // Build per-tab hrefs given the current context
  const tabHrefs = [
    "/reconciliation",
    accountId ? `/reconciliation/${accountId}` : null,
    accountId && periodId ? `/reconciliation/${accountId}/${periodId}` : null,
    accountId && periodId ? `/reconciliation/${accountId}/${periodId}/upload` : null,
    accountId && periodId ? `/reconciliation/${accountId}/${periodId}/reconcile` : null,
    accountId && periodId ? `/reconciliation/${accountId}/${periodId}/report` : null,
  ];

  function isActive(href: string | null) {
    if (!href) return false;
    return pathname === href;
  }

  return (
    <TooltipProvider>
      <header className="h-14 flex items-center px-4 pl-2 border-b border-border bg-background sticky top-0 z-20 flex-shrink-0 gap-0">
        {/* Left: sidebar trigger + breadcrumb */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-1" />
          <nav className="flex items-center gap-1 text-sm min-w-0">
            <Link
              href="/reconciliation"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground no-underline font-medium px-1.5 py-1 rounded-[var(--radius)] flex-shrink-0 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Accounting</span>
            </Link>
            <ChevronRight size={13} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">
              Reconciliation
            </span>
          </nav>
        </div>

        {/* Center: workflow tabs */}
        <div className="flex gap-px bg-muted rounded-[var(--radius)] p-[3px] flex-shrink-0">
          {TABS.map((tab, i) => {
            const href = tabHrefs[i];
            const active = href ? isActive(href) : false;
            const disabled = !href;
            return (
              <button
                key={tab.label}
                disabled={disabled}
                onClick={() => href && (window.location.href = href)}
                className={`px-3 py-1 rounded-[calc(var(--radius)-2px)] text-xs whitespace-nowrap transition-all
                  ${active
                    ? "bg-background font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                    : "font-normal text-muted-foreground hover:text-foreground"
                  }
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 flex-1 justify-end flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setPrivacy(p => !p)}
                className={`p-1.5 rounded-[var(--radius)] border-none cursor-pointer text-foreground transition-colors
                  ${privacy ? "bg-accent" : "bg-transparent hover:bg-accent"}`}
              >
                {privacy ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{privacy ? "Hide values" : "Show values"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 bg-transparent border-none rounded-[var(--radius)] cursor-pointer text-foreground hover:bg-accent transition-colors">
                <Sun size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Appearance</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4" />

          {/* Ask Fi button */}
          <div className="relative inline-flex rounded-[9px]">
            <div
              style={{ background: BRAND_GRADIENT, opacity: 0.25, filter: "blur(4px)" }}
              className="absolute inset-[-1px] rounded-[9px] pointer-events-none"
            />
            <div
              style={{ background: BRAND_GRADIENT }}
              className="relative rounded-[9px] p-px"
            >
              <button className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-[8px] bg-background border-none cursor-pointer text-[13px] font-medium text-foreground">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8M12 8v8"/>
                </svg>
                <span>Ask Fi</span>
                <div className="px-[5px] py-px bg-muted border border-border rounded text-[11px] font-semibold">/</div>
              </button>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
