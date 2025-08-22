"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChecklistCard, type ChecklistItem } from "@/components/checklists/ChecklistCard"
import { Toaster } from "@/components/ui/toaster"

const pre: ChecklistItem[] = [
  { id: "pre-1", title: "Confirm patient ID and consent", minutes: 2, done: true },
  { id: "pre-2", title: "Review labs (TSH, T3/T4)", minutes: 3, evidenceUrl: "#" },
  { id: "pre-3", title: "Pregnancy status where applicable", minutes: 1 },
]
const day: ChecklistItem[] = [
  { id: "day-1", title: "Isolation room prepared", evidenceUrl: "#" },
  { id: "day-2", title: "Dose verification by two staff", minutes: 2 },
]
const post: ChecklistItem[] = [
  { id: "post-1", title: "Discharge instructions provided", minutes: 2 },
  { id: "post-2", title: "Radioactive waste logged", minutes: 2, evidenceUrl: "#" },
]

export default function ChecklistsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Checklists</h1>
      <div className="rounded-2xl bg-transparent">
        <Tabs defaultValue="pre">
          <TabsList>
            <TabsTrigger value="pre">Pre-therapy</TabsTrigger>
            <TabsTrigger value="day">Therapy Day</TabsTrigger>
            <TabsTrigger value="post">Post-therapy</TabsTrigger>
          </TabsList>
          <TabsContent value="pre" className="pt-4 space-y-3">
            {pre.map((i) => (
              <ChecklistCard key={i.id} item={i} />
            ))}
          </TabsContent>
          <TabsContent value="day" className="pt-4 space-y-3">
            {day.map((i) => (
              <ChecklistCard key={i.id} item={i} />
            ))}
          </TabsContent>
          <TabsContent value="post" className="pt-4 space-y-3">
            {post.map((i) => (
              <ChecklistCard key={i.id} item={i} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}


