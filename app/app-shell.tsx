"use client";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/components/SidebarContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <div className="flex min-h-svh flex-col">
      <Header collapsed={collapsed ?? false} setCollapsed={setCollapsed} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 