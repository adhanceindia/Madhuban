import Image from 'next/image'

import type { MediaAsset } from '@/lib/dummy-data'

export function EditorialPhotoStrip({ items }: { items: MediaAsset[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-5">
        {items.map((item) => (
          <article
            key={item.src}
            className="bg-white/76 w-[18rem] shrink-0 rounded-[2rem] p-3 shadow-[0_22px_60px_rgba(27,28,25,0.08)] backdrop-blur sm:w-[21rem] lg:w-[24rem]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 24rem, (min-width: 640px) 21rem, 18rem"
                className="object-cover"
              />
            </div>
            {(item.title || item.caption) && (
              <div className="px-2 pb-2 pt-5">
                {item.title ? (
                  <h3 className="text-2xl italic text-foreground">
                    {item.title}
                  </h3>
                ) : null}
                {item.caption ? (
                  <p className="text-foreground/64 mt-3 text-sm leading-7">
                    {item.caption}
                  </p>
                ) : null}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
