"use client";

import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { NavMain } from "@/components/reconciliation/nav-main";
import { NavSecondary } from "@/components/reconciliation/nav-secondary";
import { NavUser } from "@/components/reconciliation/nav-user";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
