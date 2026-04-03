import Link from 'next/link'
import { Leaf } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="-mt-navbar flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/12 text-primary-dark">
          <Leaf className="size-9" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-eyebrow text-gold">
          Page Not Found
        </p>

        <h1 className="mt-4 text-balance font-display text-5xl italic leading-tight text-foreground sm:text-6xl">
          We could not find that page.
        </h1>

        <p className="mt-5 text-base leading-8 text-foreground/70">
          The page you are looking for may have been moved or does not exist.
          Head back to explore Madhuban Garden Resort and everything the resort
          has to offer.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-auto rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-label"
          >
            <Link href="/">Go Home</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-label"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
