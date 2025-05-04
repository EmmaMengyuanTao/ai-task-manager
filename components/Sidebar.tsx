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
  LogOut
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", color: "from-pink-400 to-orange-400" },
  { label: "My Task", icon: ListTodo, href: "/my-task" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "Analytics", icon: BarChart2, href: "/analytics" },
  { label: "Calender", icon: Calendar, href: "/calender" },
];
const bottomItems = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
  { label: "Logout", icon: LogOut, href: "/logout" },
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
      <div className={cn("flex flex-col flex-1 transition-all duration-300", collapsed ? "items-center" : "items-start")}> 
        <nav className="flex-1 flex flex-col gap-2 mt-4 w-full">
          {navItems.map(({ label, icon: Icon, href, color }) => {
            const selected = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "group flex items-center gap-3 mx-2 my-1 px-3 py-2 rounded-lg font-medium transition-all w-full",
                  selected
                    ? color
                      ? `bg-gradient-to-tr ${color} text-white shadow-lg` 
                      : "bg-muted text-title-foreground"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-title-foreground"
                )}
              >
                <Icon className="shrink-0" />
                <span
                  className={cn(
                    "inline-block transition-all duration-300",
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}
                  style={{
                    transitionProperty: "opacity, width",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
          <div className="flex-1" />
          {bottomItems.map(({ label, icon: Icon, href }) => {
            const selected = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "group flex items-center gap-3 mx-2 my-1 px-3 py-2 rounded-lg font-medium transition-all w-full",
                  selected
                    ? "bg-muted text-title-foreground"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-title-foreground"
                )}
              >
                <Icon className="shrink-0" />
                <span
                  className={cn(
                    "inline-block transition-all duration-300",
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}
                  style={{
                    transitionProperty: "opacity, width",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 