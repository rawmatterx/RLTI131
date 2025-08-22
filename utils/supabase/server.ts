import { createServerClient, type CookieOptions } from "@supabase/ssr"

/**
 * Server-side Supabase client for Next.js App Router.
 * Pass the result of next/headers cookies() into this function.
 *
 * Requires env:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient(cookieStore: {
  get: (name: string) => { name: string; value: string } | undefined
  set?: (name: string, value: string, options?: CookieOptions) => void
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        // In Server Components, cookies() may be readonly. If set is available, use it.
        cookieStore.set?.(name, value, options)
      },
      remove(name: string, options?: CookieOptions) {
        cookieStore.set?.(name, "", { ...options, maxAge: 0 })
      },
    },
  })
}
