'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <div className="-mt-navbar flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/12 text-primary-dark">
          <Leaf className="size-9" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-eyebrow text-gold">
          Something Went Wrong
        </p>

        <h1 className="mt-4 text-balance font-display text-5xl italic leading-tight text-foreground sm:text-6xl">
          An unexpected error occurred.
        </h1>

        <p className="mt-5 text-base leading-8 text-foreground/70">
          We ran into a problem loading this page. Please try again, or head
          back to the homepage to continue exploring Madhuban Garden Resort.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={reset}
            className="h-auto rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-label"
          >
            Try Again
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-label"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
