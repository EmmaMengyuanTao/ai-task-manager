import type { Metadata } from "next"
import "@/styles/globals.css"
import type { ReactNode } from "react"
import { Providers } from "./providers"
import { AppShell } from "./app-shell"
import { SidebarProvider } from "@/components/SidebarContext"

export const metadata: Metadata = {
    title: "Better Auth Next.js Starter",
    description: "Better Auth Next.js Starter with Postgres, Drizzle, shadcn/ui and Tanstack Query"
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="font-sans antialiased light">
                <Providers>
                    <SidebarProvider>
                        <AppShell>{children}</AppShell>
                    </SidebarProvider>
                </Providers>
            </body>
        </html>
    )
}
