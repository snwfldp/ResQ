"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Home,
  Hospital,
  MapPin,
  Siren,
  ShieldCheck,
  Zap,
  LayoutDashboard, // Using LayoutDashboard for Overview group if Home is for specific page
  BriefcaseMedical, // Example icon for Ambulance Operations
  Building, // Example icon for Hospital Interface
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const sidebarConfig = [
  {
    groupLabel: "Overview",
    groupIcon: LayoutDashboard,
    items: [
      { href: "/", label: "Dashboard", icon: Home },
    ],
  },
  {
    groupLabel: "Ambulance Operations",
    groupIcon: Siren, // Using Siren as it's representative
    items: [
      { href: "/emergency-dispatch", label: "Emergency Dispatch", icon: Zap },
    ],
  },
  {
    groupLabel: "Hospital Interface",
    groupIcon: Hospital, // Using Hospital icon
    items: [
      { href: "/hospital-portal", label: "Hospital Portal", icon: Building }, // Or use Hospital icon again
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 items-center justify-center">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Siren className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            ResQ
          </h1>
        </Link>
      </SidebarHeader>
      <Separator className="mb-2" />
      <SidebarContent>
        {sidebarConfig.map((group) => (
          <SidebarGroup key={group.groupLabel}>
            <SidebarGroupLabel className="flex items-center gap-2">
              <group.groupIcon className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">{group.groupLabel}</span>
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className={cn(
                        "justify-start",
                        pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      )}
                      tooltip={item.label}
                    >
                      <a>
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
           <ShieldCheck className="h-5 w-5 text-green-500" />
           <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Secure Connection</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
