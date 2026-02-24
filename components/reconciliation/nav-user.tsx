"use client";

import {
  CreditCard, HelpCircle, Key, Layers, LogOut,
  MoreVertical, Shield, SlidersHorizontal, User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { BRAND_GRADIENT } from "@/lib/utils";

export function NavUser() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 rounded-lg -ml-2 flex-shrink-0">
                <AvatarFallback
                  className="text-white text-xs font-bold rounded-lg"
                  style={{ background: BRAND_GRADIENT }}
                >
                  AL
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">Acme Corp</span>
                <span className="truncate text-xs text-muted-foreground">Alina</span>
              </div>
              <MoreVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2">
                <Avatar className="h-9 w-9 rounded-sm">
                  <AvatarFallback
                    className="text-white text-xs font-bold rounded-sm"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    AL
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Corp</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" />Subscriptions &amp; Billing</DropdownMenuItem>
              <DropdownMenuItem><Layers className="mr-2 h-4 w-4" />Integrations</DropdownMenuItem>
              <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />External Access</DropdownMenuItem>
              <DropdownMenuItem><Key className="mr-2 h-4 w-4" />API Access</DropdownMenuItem>
              <DropdownMenuItem><HelpCircle className="mr-2 h-4 w-4" />Get Help</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2">
                <Avatar className="h-9 w-9 rounded-sm">
                  <AvatarFallback
                    className="text-white text-xs font-bold rounded-sm"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    AL
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Alina</span>
                  <span className="truncate text-xs text-muted-foreground">alina@acmecorp.com</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              <DropdownMenuItem><User className="mr-2 h-4 w-4" />Profile Settings</DropdownMenuItem>
              <DropdownMenuItem><SlidersHorizontal className="mr-2 h-4 w-4" />Preferences</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
