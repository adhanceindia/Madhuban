import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SiteIcon } from '@/components/shared/site-icon'

export function EditorialCtaPanel({
  eyebrow = 'Next Step',
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow?: string
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div className="rounded-card bg-[linear-gradient(135deg,rgba(56,106,14,0.94),rgba(101,145,43,0.92))] px-6 py-8 text-white shadow-[0_26px_70px_rgba(56,106,14,0.2)] sm:px-8 sm:py-10 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-white/70">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl text-balance text-4xl italic leading-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
        {description}
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="hover:bg-white/92 h-auto rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-tag text-primary-deep"
        >
          <Link href={primaryHref}>
            {primaryLabel}
            <SiteIcon icon="ArrowRight" className="size-4" />
          </Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/24 hover:bg-white/14 h-auto rounded-full bg-white/10 px-7 py-4 text-sm font-semibold uppercase tracking-tag text-white"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
