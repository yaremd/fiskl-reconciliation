"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calculator, DollarSign, Receipt, FileText, User, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const COMPANY_NAV = [
  { title: "Company Profile", href: "/settings/company", icon: Building2 },
  { title: "Accounting", href: "/settings/accounting", icon: Calculator },
  { title: "Currency Management", href: "/settings/currencies", icon: DollarSign },
  { title: "Tax Management", href: "/settings/taxes", icon: Receipt },
  { title: "Invoice & Quote Settings", href: "/settings/invoices", icon: FileText },
];

const USER_NAV = [
  { title: "Account", href: "/settings/account", icon: User },
  { title: "Preferences", href: "/settings/preferences", icon: Settings },
];

function NavItem({ title, href, icon: Icon }: { title: string; href: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {title}
    </Link>
  );
}

export function SettingsSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r pr-6 -ml-6 pl-6 py-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Company</p>
      <nav className="flex flex-col gap-0.5">
        {COMPANY_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <Separator className="my-4" />

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">User</p>
      <nav className="flex flex-col gap-0.5">
        {USER_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
