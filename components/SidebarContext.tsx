"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext<{
  collapsed: boolean | undefined;
  setCollapsed: (c: boolean) => void;
}>({
  collapsed: undefined,
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean | undefined>(undefined);

  // Read from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsedState(stored === "true");
    else setCollapsedState(false);
  }, []);

  // Write to localStorage when state changes
  const setCollapsed = (c: boolean) => {
    setCollapsedState(c);
    localStorage.setItem("sidebar-collapsed", String(c));
  };

  // When collapsed is undefined, do not render children to avoid flickering
  if (collapsed === undefined) return null;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
} 