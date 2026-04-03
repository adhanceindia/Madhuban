export function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card-inner border border-card-accent/80 bg-warm-base shadow-[0_22px_55px_rgba(56,106,14,0.06)]">
      <div className="relative aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-4 p-6 sm:p-7">
        <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-2">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}
