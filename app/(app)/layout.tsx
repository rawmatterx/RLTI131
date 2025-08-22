import type { PropsWithChildren } from "react"
import { MobileTabs } from "@/components/chrome/MobileTabs"
import { Header } from "@/components/chrome/Header"
import { Sidebar } from "@/components/chrome/Sidebar"
import { CommandPalette } from "@/components/CommandPalette"

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="hidden lg:block pt-6"><Sidebar /></aside>
          <main className="py-6">{children}</main>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <MobileTabs />
      </div>
      <CommandPalette />
    </div>
  )
}


