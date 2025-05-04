"use client";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/components/SidebarContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <div>
      <Header collapsed={collapsed ?? false} setCollapsed={setCollapsed} />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
} 