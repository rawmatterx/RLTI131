import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, ListTodo } from "lucide-react"

// Server Component: Todos
export default async function TodosPage() {
  const cookieStore = cookies()

  let error: string | null = null
  let todos: any[] | null = null

  try {
    const supabase = createClient(cookieStore)
    const { data, error: qErr } = await supabase.from("todos").select().order("created_at", { ascending: false })
    if (qErr) throw qErr
    todos = data
  } catch (e: any) {
    error = e?.message || "Failed to load todos"
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Todos</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{todos?.length ?? 0} items</Badge>
            <Button size="sm" variant="outline" asChild>
              <a href="/assistant">Back to Assistant</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : !todos || todos.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No todos yet.
            </div>
          ) : (
            <ul className="divide-y">
              {todos.map((todo) => {
                const title = todo.title ?? todo.task ?? todo.name ?? String(todo.id ?? "Untitled")
                const done = Boolean(todo.completed ?? todo.is_done ?? false)
                const created = todo.created_at ? new Date(todo.created_at).toLocaleString() : null
                return (
                  <li key={todo.id ?? title} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{title}</div>
                      {created && <div className="text-xs text-muted-foreground">{created}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      {done ? (
                        <Badge className="gap-1" variant="secondary">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
