"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  User
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects",   icon: FolderKanban,  href: "/projects" },
  { label: "My Task",    icon: ListTodo,      href: "/my-task" },
  { label: "Profile",    icon: User,         href: "/profile" },
];

export function Sidebar() {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 z-40 bg-sidebar border-r transition-all duration-300",
        collapsed ? "w-20" : "w-60",
        "top-16",
        "h-[calc(100vh-4rem)]"
      )}
    >
      <nav className="flex-1 flex flex-col gap-1 pt-4">
        {navItems.map(({ label, icon: Icon, href }) => {
          const selected = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <div key={label} className="relative px-4">
              <Link
                href={href}
                style={{
                  width: collapsed ? '48px' : 'calc(100% - 8px)',
                  transition: 'all 300ms ease'
                }}
                className={cn(
                  "group flex items-center my-1 rounded-lg font-medium relative overflow-hidden",
                  selected
                    ? "bg-gradient-to-tr from-blue-500 to-blue-400 text-white"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-title-foreground"
                )}
              >
                <div className="flex items-center h-12 w-12 justify-center flex-shrink-0">
                  <Icon className="shrink-0" />
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap ml-1 transition-all duration-300",
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
      </nav>
    </aside>
  );
}