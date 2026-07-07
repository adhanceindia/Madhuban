import Image from 'next/image'
import { SectionHeading } from '@/components/shared/section-heading'

type GalleryBlockProps = {
  title?: string
  image1?: string
  image2?: string
  image3?: string
}

export function GalleryBlock({ title, image1, image2, image3 }: GalleryBlockProps) {
  const images = [image1, image2, image3].filter(Boolean) as string[]
  
  if (images.length === 0) return null

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Gallery" title={title || 'Gallery'} centered />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={src} alt="Gallery image" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
