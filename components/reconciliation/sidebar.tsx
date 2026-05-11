"use client";

import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { NavMain } from "@/components/reconciliation/nav-main";
import { NavUser } from "@/components/reconciliation/nav-user";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
