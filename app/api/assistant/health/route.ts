import { NextResponse } from "next/server"

const MODELS_URL = "https://openrouter.ai/api/v1/models"

export async function GET() {
  const model = process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free"
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
    "Content-Type": "application/json",
  }
  if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL
  if (process.env.OPENROUTER_SITE_TITLE) headers["X-Title"] = process.env.OPENROUTER_SITE_TITLE

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { ok: false, model, available: false, latencyMs: null, error: "Missing OPENROUTER_API_KEY" },
      { status: 200 },
    )
  }

  const t0 = Date.now()
  try {
    const resp = await fetch(MODELS_URL, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    const latencyMs = Date.now() - t0

    if (!resp.ok) {
      const body = await resp.text().catch(() => "")
      return NextResponse.json(
        { ok: false, model, available: false, latencyMs, error: `OpenRouter models error ${resp.status}: ${body}` },
        { status: 200 },
      )
    }

    const json: any = await resp.json()
    const available = Array.isArray(json?.data) && json.data.some((m: any) => m?.id === model)

    return NextResponse.json({ ok: true, model, available, latencyMs }, { status: 200 })
  } catch (e: any) {
    const latencyMs = Date.now() - t0
    return NextResponse.json(
      { ok: false, model, available: false, latencyMs, error: e?.message || "Fetch failed" },
      { status: 200 },
    )
  }
}
