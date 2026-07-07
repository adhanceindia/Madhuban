'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'

const defaultInstagramPhotos = [
  { src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', alt: 'Resort garden grounds' },
  { src: 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?auto=format&fit=crop&w=600&q=80', alt: 'Resort swimming pool' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80', alt: 'Outdoor dining experience' },
  { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80', alt: 'Wedding floral decor' },
  { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80', alt: 'Resort exterior view' },
  { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', alt: 'Celebration moments' },
]

type InstagramPhoto = {
  src: string
  alt: string
}

type InstagramFeedBlockProps = {
  eyebrow?: string
  title?: string
  description?: string
  instagramHandle?: string
  instagramLink?: string
  photos?: InstagramPhoto[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function InstagramFeedBlock({
  eyebrow,
  title,
  description,
  instagramHandle,
  instagramLink,
  photos,
}: InstagramFeedBlockProps) {
  const reduceMotion = useReducedMotion()

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.65, ease: easing },
    },
  }

  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: easing },
    },
  }

  const handle = instagramHandle || '@madhubangarden'
  const link = instagramLink || 'https://instagram.com/madhubangarden'
  const displayPhotos = photos && photos.length > 0 ? photos : defaultInstagramPhotos

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-warm-green py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          eyebrow={eyebrow || 'Instagram'}
          title={title || `Follow Our Journey ${handle}`}
          description={description || 'Fresh event moments, peaceful resort corners, and celebrations worth remembering.'}
        />

        <motion.div
          variants={containerVariants}
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3"
        >
          {displayPhotos.map((photo, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative aspect-square overflow-hidden rounded-card-md shadow-[0_16px_40px_rgba(46,125,50,0.05)]"
            >
              <Image
                src={photo.src}
                alt={photo.alt || `Instagram photo ${index + 1}`}
                fill
                sizes="(min-width: 768px) 30vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
                <p className="translate-y-2 text-sm font-semibold tracking-wide text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {handle}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-label"
          >
            <Link href={link} target="_blank" rel="noreferrer">
              Follow on Instagram
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}
