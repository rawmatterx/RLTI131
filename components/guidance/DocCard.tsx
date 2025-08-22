import { Badge } from "@/components/ui/badge"

export function DocCard({ title, summary, evidence, lastReviewed }: { title: string; summary: string; evidence: string[]; lastReviewed: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-card p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">Last reviewed {lastReviewed}</span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{summary}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {evidence.map((e, i) => (
          <Badge key={i} variant="secondary">{e}</Badge>
        ))}
      </div>
    </div>
  )
}


