import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const status = searchParams.get("status") || "All"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25", 10), 200)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ data: [], page, pageSize, total: 0 })
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get: () => undefined,
      set: () => undefined,
      remove: () => undefined,
    },
  })

  let query = supabase.from("patients").select("*", { count: "exact" })
  if (status && status !== "All") query = query.eq("status", status)
  if (q) query = query.or(`name.ilike.%${q}%,mrn.ilike.%${q}%,id.ilike.%${q}%` as any)
  query = query.order("scheduled_at", { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, page, pageSize, total: count ?? 0 })
}


