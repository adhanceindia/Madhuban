export function GalleryImageSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white/70 shadow-[0_16px_40px_rgba(46,125,50,0.05)]">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-3 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
