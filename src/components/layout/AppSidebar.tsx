
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Home,
  Hospital,
  MapPin,
  Siren,
  ShieldCheck,
  Waypoints,
  Zap, // Added Zap
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
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/emergency-dispatch", label: "Emergency Dispatch", icon: Zap },
  { href: "/assessment", label: "Condition Assessment", icon: Activity },
  { href: "/recommendations", label: "Hospital Finder", icon: Waypoints },
  { href: "/hospital-portal", label: "Hospital Portal", icon: Hospital },
  { href: "/tracking", label: "Ambulance Tracking", icon: MapPin },
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
        <SidebarMenu>
          {navItems.map((item) => (
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

    