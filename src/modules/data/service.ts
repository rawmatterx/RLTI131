import type { Assessment } from "@/src/types"

export interface SaveResult { id: string; saved: boolean }

function getEnv(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    // In browser, Vite/Next will inline NEXT_PUBLIC_ vars at build time; also allow runtime via window.__env
    // @ts-ignore
    const inline = (typeof process !== 'undefined' && process.env && (process.env as any)[key]) as string | undefined
    // @ts-ignore
    const runtime = (window as any).__env?.[key] as string | undefined
    return runtime || inline
  }
  if (typeof process !== 'undefined' && process.env) return (process.env as any)[key]
  return undefined
}

function getBackendBase(): string {
  const base = getEnv('NEXT_PUBLIC_BACKEND_URL') || (typeof window !== 'undefined' ? 'http://localhost:3001' : '')
  return base.replace(/\/$/, '')
}

export const dataService = {
  async saveAssessment(assessment: Partial<Assessment> & { id?: string }): Promise<SaveResult> {
    // Prefer Supabase if configured
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)
      const payload = { ...assessment, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase.from('assessments').upsert(payload).select('id').single()
      if (error) throw error
      return { id: data.id, saved: true }
    }

    // Fallback to local backend
    const base = getBackendBase() || ''
    const res = await fetch(`${base}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    return res.json()
  },

  async listAssessments(): Promise<{ count: number; files: string[] } | any[]> {
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase.from('assessments').select('id, patient->>name, updatedAt').order('updatedAt', { ascending: false })
      if (error) throw error
      return data || []
    }
    const base = getBackendBase() || ''
    const res = await fetch(`${base}/api/assessments`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`List failed: ${res.status}`)
    return res.json()
  },
}


