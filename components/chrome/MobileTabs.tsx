"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/", label: "Home" },
  { href: "/patients", label: "Patients" },
  { href: "/checklists", label: "Checklists" },
  { href: "/guidance", label: "Guidance" },
]

export function MobileTabs() {
  const pathname = usePathname()
  return (
    <div className="grid grid-cols-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {tabs.map((t) => {
        const active = pathname?.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href} className="px-3 py-2 text-center text-xs">
            <span className={active ? "font-semibold" : "text-zinc-500"}>{t.label}</span>
          </Link>
        )
      })}
    </div>
  )
}


