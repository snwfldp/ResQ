"use client";

import { usePathname } from "next/navigation";
import { Bell, UserCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar"; 

// Updated navItems for page title lookup, removing deprecated pages
const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/emergency-dispatch", label: "Emergency Dispatch" },
  { href: "/hospital-portal", label: "Hospital Portal" },
];

function getPageTitle(pathname: string): string {
  const item = navItems.find((navItem) => navItem.href === pathname);
  if (item) return item.label;

  // Fallback for pages not explicitly in navItems, like grouped ones
  if (pathname.startsWith("/emergency-dispatch")) return "Emergency Dispatch";
  if (pathname.startsWith("/hospital-portal")) return "Hospital Portal";
  if (pathname.startsWith("/tracking")) return "Ambulance Tracking";
  
  return "ResQ"; // Default title
}

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {isMobile && (
        <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      )}
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-6 w-6" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
