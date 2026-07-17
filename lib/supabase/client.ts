import { createBrowserClient } from '@supabase/ssr'

export type AuthContext = 'admin' | 'customer'

export function createSupabaseBrowserClient(context: AuthContext) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: `sb-${context}-auth-token`,
      },
    }
  )
}
