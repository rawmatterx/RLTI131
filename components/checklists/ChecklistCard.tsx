"use client"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export type ChecklistItem = {
  id: string
  title: string
  evidenceUrl?: string
  minutes?: number
  done?: boolean
}

export function ChecklistCard({ item }: { item: ChecklistItem }) {
  const [done, setDone] = useState(!!item.done)
  const { toast } = useToast()

  async function toggle() {
    const prev = done
    setDone(!done)
    try {
      await new Promise((r) => setTimeout(r, 300))
      toast({ title: done ? "Marked incomplete" : "Marked complete", description: item.title })
    } catch {
      setDone(prev)
      toast({ title: "Failed to update", description: "Please try again.", variant: "destructive" as any })
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-card p-4 flex items-start gap-3">
      <Checkbox checked={done} onCheckedChange={toggle} className="mt-1" />
      <div className="flex-1">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-zinc-500 mt-1 flex gap-3">
          {item.minutes ? <span>~{item.minutes} min</span> : null}
          {item.evidenceUrl ? (
            <a href={item.evidenceUrl} target="_blank" className="underline underline-offset-2">evidence</a>
          ) : null}
        </div>
      </div>
      <Button variant="ghost" onClick={toggle}>{done ? "Undo" : "Done"}</Button>
    </div>
  )
}


