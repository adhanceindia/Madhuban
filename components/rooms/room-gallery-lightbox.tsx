'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RoomGalleryLightboxProps {
  images: string[]
  isOpen: boolean
  initialIndex?: number
  onClose: () => void
}

export function RoomGalleryLightbox({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
}: RoomGalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Sync state if initialIndex changes when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent scrolling while lightbox is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, goToNext, goToPrev])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 py-6 text-white/70">
            <div className="text-sm font-medium tracking-widest">
              {currentIndex + 1} / {images.length}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-4 sm:left-8 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full p-3 text-white/50 hover:bg-white/10 hover:text-white transition-all sm:p-4"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-8 sm:size-10" strokeWidth={1.5} />
          </button>

          {/* Main Image */}
          <div className="relative h-full max-h-[90vh] w-full max-w-[90vw] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full"
              >
                <Image
                  src={images[currentIndex]}
                  alt={`Gallery image ${currentIndex + 1}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 sm:right-8 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full p-3 text-white/50 hover:bg-white/10 hover:text-white transition-all sm:p-4"
            aria-label="Next image"
          >
            <ChevronRight className="size-8 sm:size-10" strokeWidth={1.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
