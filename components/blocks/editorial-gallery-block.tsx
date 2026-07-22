'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import { createEditorialMotion } from '@/lib/motion'
import { SectionHeading } from '@/components/shared/section-heading'
import { EditorialPhotoStrip } from '@/components/shared/editorial-photo-strip'
import { cn } from '@/lib/utils'

export interface EditorialGalleryBlockProps {
  eyebrow?: string
  title?: string
  description?: string
  layout?: 'strip' | 'grid'
  images: string[]
}

export function EditorialGalleryBlock({
  eyebrow,
  title,
  description,
  layout = 'strip',
  images,
}: EditorialGalleryBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants, containerVariants } =
    createEditorialMotion(reduceMotion)

  const mediaAssets = images.map((src) => ({ src, alt: title || 'Gallery Image' }))

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
      className="bg-warm-base py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <SectionHeading
            eyebrow={eyebrow || ''}
            title={title || ''}
            description={description}
          />
        )}

        <div className="mt-10">
          {layout === 'strip' ? (
            <EditorialPhotoStrip items={mediaAssets} />
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6"
            >
              {images.map((src, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    'relative overflow-hidden rounded-card-md border border-[#d7dfce] bg-white shadow-[0_18px_50px_rgba(56,106,14,0.08)]',
                    'aspect-[4/5]'
                  )}
                >
                  <Image
                    src={src}
                    alt={title || 'Gallery image'}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
