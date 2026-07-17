'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server.ts'
import { getDb } from '@/db/client.ts'
import { users } from '@/db/schema/users.ts'
import { eq } from 'drizzle-orm'

export async function checkUserExists(email: string) {
  const db = getDb()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)
  return !!user
}

export async function signInWithOtp(email: string) {
  const supabase = await createSupabaseServerClient('customer')
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createSupabaseServerClient('customer')
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient('customer')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createSupabaseServerClient('customer')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)
  
  if (data.user) {
    const db = getDb()
    await db.insert(users).values({
      auth_id: data.user.id,
      email,
      name,
      role: 'customer',
    }).onConflictDoNothing() // ponytail: simplest robust way
  }
  return { success: true }
}
