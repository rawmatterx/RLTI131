import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListTodo } from "lucide-react"
import Link from "next/link"

// Simple static todos page (no Supabase dependency)
export default function TodosPage() {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Todos</CardTitle>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/assistant">Back to Assistant</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No todos configured. This page is available for future task management features.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}