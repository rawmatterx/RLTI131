import Link from "next/link"

export function Sidebar() {
  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/assessment", label: "Assessment" },
    { href: "/assistant", label: "Assistant" },
    { href: "/checklists", label: "Checklists" },
    { href: "/guidance", label: "Guidance" },
  ]
  return (
    <nav className="space-y-1">
      {items.map((i) => (
        <Link key={i.href} className="block px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" href={i.href}>{i.label}</Link>
      ))}
    </nav>
  )
}


