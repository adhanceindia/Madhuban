import { Leaf } from 'lucide-react'

export default function Loading() {
  return (
    <div className="-mt-navbar flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-primary/12 text-primary-dark">
          <Leaf className="size-7" />
        </div>
        <div className="space-y-3 text-center">
          <div className="mx-auto h-5 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
