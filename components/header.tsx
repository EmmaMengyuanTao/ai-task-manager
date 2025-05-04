"use client";
import Link from "next/link"
import { Menu, ChevronLeft } from "lucide-react"

export function Header({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (c: boolean) => void }) {
    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="flex items-center gap-4 px-4">
                <button
                    className="p-2 rounded hover:bg-muted transition flex items-center justify-center"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
                </button>
                <Link href="/" className="flex items-center gap-2 text-title-foreground">
                    <span className="inline-block w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-400 to-orange-400" />
                    <span className="text-lg font-bold">TaskMosaic</span>
                </Link>
            </div>
        </header>
    )
}
