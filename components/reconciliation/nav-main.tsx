"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight, Home, Package, PieChart, Settings,
  ShoppingBag, ShoppingCart, Users, Wallet, type LucideIcon,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  submenu?: MenuItem[];
}

const NAV: MenuItem[] = [
  { title: "Dashboard", url: "#", icon: Home },
  {
    title: "Sales", url: "#", icon: ShoppingBag,
    submenu: [
      { title: "Invoices", url: "/invoices" },
      { title: "Recurring Invoices", url: "#" },
      { title: "Quotes", url: "#" },
      { title: "Clients", url: "#" },
    ],
  },
  {
    title: "Purchases", url: "#", icon: ShoppingCart,
    submenu: [
      { title: "Time", url: "#" },
      { title: "Mileage", url: "/mileage" },
      { title: "Vendors", url: "#" },
      { title: "Expenses", url: "#" },
      { title: "AI Expenses", url: "#" },
    ],
  },
  {
    title: "Accounting", url: "#", icon: PieChart,
    submenu: [
      { title: "Chart of Accounts", url: "#" },
      { title: "Reports", url: "#" },
      { title: "Multi Journal", url: "#" },
      { title: "Transactions", url: "#" },
      { title: "Reconciliation", url: "/reconciliation" },
      { title: "Fixed Assets", url: "/fixed-assets" },
    ],
  },
  { title: "Products & Services", url: "#", icon: Package },
  { title: "Banking", url: "#", icon: Wallet },
  { title: "Team Members", url: "#", icon: Users },
  {
    title: "Settings", url: "/settings/accounting", icon: Settings,
    submenu: [
      { title: "Company Profile", url: "/settings/company" },
      { title: "Accounting", url: "/settings/accounting" },
      { title: "Currency Management", url: "/settings/currencies" },
      { title: "Tax Management", url: "/settings/taxes" },
      { title: "Invoice & Quote Settings", url: "/settings/invoices" },
      { title: "Account", url: "/settings/account" },
      { title: "Preferences", url: "/settings/preferences" },
    ],
  },
];

export function NavMain() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile, state } = useSidebar();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Sales: true,
    Purchases: true,
    Accounting: true,
  });

  function handleClick(url: string) {
    if (url === "#") return;
    router.push(url);
    if (isMobile) setOpenMobile(false);
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Logo */}
        <div className="px-2 pb-1">
          <div className="flex items-center gap-0">
            {state === "collapsed" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/fiskl-mark.svg" alt="fiskl" className="w-7 h-7" />
            ) : (
              <div className="flex flex-col gap-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fiskl-logo.svg" alt="fiskl" className="h-6 w-auto" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.06em] pl-0.5">Pro Plan</span>
              </div>
            )}
          </div>
        </div>

        <SidebarMenu>
          {NAV.map((item) =>
            item.submenu ? (
              <Collapsible
                key={item.title}
                open={openSections[item.title] ?? false}
                onOpenChange={() =>
                  setOpenSections((prev) => ({ ...prev, [item.title]: !prev[item.title] }))
                }
                className="group/collapsible"
              >
                <SidebarMenuItem className="cursor-pointer">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.submenu.map((sub) => {
                        const isActive = sub.url !== "#" && pathname.startsWith(sub.url);
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              data-active={isActive}
                              className={cn(
                                "cursor-pointer",
                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              )}
                            >
                              <button onClick={() => handleClick(sub.url)}>
                                <span>{sub.title}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => handleClick(item.url)}
                  data-active={item.url !== "#" && pathname.startsWith(item.url)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
