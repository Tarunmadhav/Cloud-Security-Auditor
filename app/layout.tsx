import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PentestSec - Cloud Security Auditor",
  description:
    "Automated cloud pentesting and security auditing platform for AWS, Azure, and GCP infrastructure",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1 text-muted-foreground" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-low opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-severity-low" />
                  </span>
                  <span>Systems Operational</span>
                </div>
              </header>
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
