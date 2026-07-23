'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const WARNING_TIME_MS = 25 * 60 * 1000 // 25 minutes
const LOGOUT_TIME_MS = 30 * 60 * 1000 // 30 minutes
const THROTTLE_MS = 5000 // 5 seconds

export function IdleTimeoutProvider({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0) // seconds remaining until logout
  const lastActive = useRef<number>(Date.now())
  const lastSync = useRef<number>(0)
  const router = useRouter()
  const bc = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    // Initialize BroadcastChannel for cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc.current = new BroadcastChannel('admin-idle-sync')
      bc.current.onmessage = (event) => {
        if (event.data.type === 'ACTIVITY') {
          lastActive.current = event.data.timestamp
          if (showWarning) setShowWarning(false)
        } else if (event.data.type === 'LOGOUT') {
          router.push('/admin/login?reason=inactivity')
        }
      }
    }

    // Fallback: localStorage sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin-idle-sync' && e.newValue) {
        lastActive.current = parseInt(e.newValue, 10)
        if (showWarning) setShowWarning(false)
      } else if (e.key === 'admin-idle-logout') {
        router.push('/admin/login?reason=inactivity')
      }
    }
    window.addEventListener('storage', handleStorage)

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActive.current > THROTTLE_MS) {
        lastActive.current = now
        if (showWarning) setShowWarning(false)
        
        // Sync to other tabs
        if (bc.current) {
          bc.current.postMessage({ type: 'ACTIVITY', timestamp: now })
        } else {
          localStorage.setItem('admin-idle-sync', now.toString())
        }
      }
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach(event => window.addEventListener(event, handleActivity))

    const interval = setInterval(() => {
      const now = Date.now()
      const idleTime = now - lastActive.current

      if (idleTime >= LOGOUT_TIME_MS) {
        clearInterval(interval)
        performLogout()
      } else if (idleTime >= WARNING_TIME_MS) {
        setShowWarning(true)
        setRemainingTime(Math.ceil((LOGOUT_TIME_MS - idleTime) / 1000))
      } else {
        setShowWarning(false)
      }
    }, 1000)

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      clearInterval(interval)
      window.removeEventListener('storage', handleStorage)
      if (bc.current) bc.current.close()
    }
  }, [router, showWarning])

  const performLogout = async () => {
    if (bc.current) {
      bc.current.postMessage({ type: 'LOGOUT' })
    } else {
      localStorage.setItem('admin-idle-logout', Date.now().toString())
    }
    const supabase = createSupabaseBrowserClient('admin')
    await supabase.auth.signOut()
    router.push('/admin/login?reason=inactivity')
  }

  const handleStayLoggedIn = () => {
    const now = Date.now()
    lastActive.current = now
    setShowWarning(false)
    if (bc.current) {
      bc.current.postMessage({ type: 'ACTIVITY', timestamp: now })
    } else {
      localStorage.setItem('admin-idle-sync', now.toString())
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border p-6 rounded-lg shadow-xl max-w-sm w-full text-center font-admin">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Session Expiring Soon</h2>
            <p className="text-muted-foreground text-sm mb-4">
              You&apos;ll be logged out in {formatTime(remainingTime)} due to inactivity.
            </p>
            <button
              onClick={handleStayLoggedIn}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-600 transition-colors"
            >
              Stay logged in
            </button>
          </div>
        </div>
      )}
    </>
  )
}
