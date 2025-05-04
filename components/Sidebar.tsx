"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  BarChart2,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", color: "from-pink-400 to-orange-400" },
  { label: "My Task",    icon: ListTodo,      href: "/my-task" },
  { label: "Projects",   icon: FolderKanban,  href: "/projects" },
  { label: "Teams",      icon: Users,         href: "/teams" },
  { label: "Analytics",  icon: BarChart2,     href: "/analytics" },
  { label: "Calendar",   icon: Calendar,      href: "/calendar" },
];

const bottomItems = [
  { label: "Settings", icon: Settings,  href: "/settings" },
  { label: "Help",     icon: HelpCircle, href: "/help" },
  { label: "Logout",   icon: LogOut,     href: "/logout" },
];

export function Sidebar() {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 z-40 flex flex-col bg-sidebar border-r transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <nav className="flex-1 flex flex-col gap-2 mt-4">
        {navItems.map(({ label, icon: Icon, href, color }) => {
          const selected = pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <div key={label} className="relative px-4">
              <Link
                href={href}
                className={cn(
                  "group flex items-center my-1 rounded-lg font-medium transition-all duration-300",
                  "overflow-hidden",
                  collapsed ? "w-12" : "w-[calc(100%-8px)]",
                  selected
                    ? color
                      ? `bg-gradient-to-tr ${color} text-white shadow-lg`
                      : "bg-muted text-title-foreground"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-title-foreground"
                )}
              >
                <div className="flex items-center h-12 w-12 justify-center flex-shrink-0">
                  <Icon className="shrink-0" />
                </div>
                <span 
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 ml-1",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {label}
                </span>
              </Link>
            </div>
          );
        })}

        <div className="flex-1" />

        {bottomItems.map(({ label, icon: Icon, href }) => {
          const selected = pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <div key={label} className="relative px-4">
              <Link
                href={href}
                className={cn(
                  "group flex items-center my-1 rounded-lg font-medium transition-all duration-300",
                  "overflow-hidden",
                  collapsed ? "w-12" : "w-[calc(100%-8px)]",
                  selected
                    ? "bg-muted text-title-foreground"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-title-foreground"
                )}
              >
                <div className="flex items-center h-12 w-12 justify-center flex-shrink-0">
                  <Icon className="shrink-0" />
                </div>
                <span 
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 ml-1",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {label}
                </span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}