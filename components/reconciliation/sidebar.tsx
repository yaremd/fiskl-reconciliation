"use client";

import Link from "next/link";
import {
  Home, ShoppingBag, ShoppingCart, PieChart, Package, Wallet, Users,
  Settings, ChevronRight, MoreVertical, LogOut, CreditCard, Layers,
  Shield, HelpCircle, User, SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BRAND_GRADIENT } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/reconciliation/mock-data";
import type { NavItem } from "@/types/reconciliation";

const NAV_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home,
  shoppingBag: ShoppingBag,
  shoppingCart: ShoppingCart,
  pieChart: PieChart,
  package: Package,
  wallet: Wallet,
  users: Users,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const W = collapsed ? 48 : 256;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ accounting: true });

  function toggleSection(id: string) {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <TooltipProvider>
      <div
        style={{ width: W, minWidth: W, transition: "width .25s ease, min-width .25s ease" }}
        className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 flex-shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center gap-2 ${collapsed ? "p-[14px_12px]" : "p-[14px_12px_10px]"}`}>
          <div
            style={{ background: BRAND_GRADIENT }}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white font-extrabold text-[13px] flex-shrink-0"
          >
            F
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-sidebar-foreground leading-tight">Fiskl</div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.06em]">Pro Plan</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-1">
          {NAV_ITEMS.map((item: NavItem) => {
            const NavIcon = NAV_ICONS[item.icon];
            const isOpen = openSections[item.id];
            const hasActive = item.sub?.some(s => s.active);

            return (
              <div key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => item.sub ? toggleSection(item.id) : undefined}
                      className={`flex items-center gap-2 w-full rounded-[var(--radius)] text-[13px] transition-colors cursor-pointer
                        ${collapsed ? "justify-center p-2" : "px-2 py-2"}
                        ${hasActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground font-normal hover:bg-sidebar-accent"
                        }`}
                    >
                      {NavIcon && <NavIcon size={16} />}
                      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.sub && (
                        <ChevronRight
                          size={14}
                          className="transition-transform"
                          style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>

                {!collapsed && item.sub && isOpen && (
                  <div className="pl-3 mb-0.5">
                    {item.sub.map(sub => (
                      <Link key={sub.id} href={sub.url === "#" ? "#" : sub.url}>
                        <button
                          className={`block w-full px-2 py-1.5 rounded-[var(--radius)] text-[13px] text-left transition-colors cursor-pointer
                            ${sub.active
                              ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                              : "text-sidebar-foreground font-normal hover:bg-sidebar-accent"
                            }`}
                        >
                          {sub.label}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div className="p-2 border-t border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`flex items-center gap-2 w-full text-sidebar-foreground rounded-[var(--radius)] text-[13px] hover:bg-sidebar-accent transition-colors cursor-pointer
                  ${collapsed ? "justify-center p-2" : "px-2 py-2"}`}
              >
                <Settings size={16} />
                {!collapsed && <span>Settings</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Settings</TooltipContent>}
          </Tooltip>
        </div>

        {/* User footer */}
        <div className="p-2 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 w-full text-sidebar-foreground rounded-[var(--radius)] hover:bg-sidebar-accent transition-colors cursor-pointer
                  ${collapsed ? "justify-center p-2" : "px-2 py-2"}`}
              >
                <div
                  style={{ background: BRAND_GRADIENT }}
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                >
                  AL
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[13px] font-medium text-sidebar-foreground truncate">Acme Corp</div>
                      <div className="text-[11px] text-muted-foreground truncate">Alina</div>
                    </div>
                    <MoreVertical size={14} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Company</DropdownMenuLabel>
              <DropdownMenuItem><CreditCard size={14} />Subscriptions &amp; Billing</DropdownMenuItem>
              <DropdownMenuItem><Layers size={14} />Integrations</DropdownMenuItem>
              <DropdownMenuItem><Shield size={14} />External Access</DropdownMenuItem>
              <DropdownMenuItem><HelpCircle size={14} />Get Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem><User size={14} />Profile Settings</DropdownMenuItem>
              <DropdownMenuItem><SlidersHorizontal size={14} />Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut size={14} />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
