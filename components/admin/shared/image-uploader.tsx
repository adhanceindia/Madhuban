'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { MediaLibraryModal } from './media-library-modal'

type ImageUploaderProps = {
  /** Currently uploaded image URLs */
  value: string[]
  /** Called when the array changes (after upload, delete, reorder) */
  onChange: (urls: string[]) => void
  /** Allow multiple files at once */
  multiple?: boolean
  /** Max number of images */
  maxImages?: number
  /** Folder in storage (e.g., 'rooms', 'gallery') */
  folder?: string
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 20,
}: ImageUploaderProps) {
  const [reorderIndex, setReorderIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  function move(from: number, to: number) {
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            draggable
            onDragStart={() => setReorderIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (reorderIndex !== null && reorderIndex !== i) {
                move(reorderIndex, i)
              }
              setReorderIndex(null)
            }}
            className="relative group rounded-lg overflow-hidden bg-sage-soft aspect-video border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />

            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 bg-foreground/80 text-white rounded-md w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>

            <div className="absolute top-1.5 left-1.5 bg-foreground/80 text-white rounded-md w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <GripVertical size={14} />
            </div>

            {i === 0 && (
              <div className="absolute bottom-1.5 left-1.5 bg-accent text-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Primary
              </div>
            )}
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors border-border bg-sage-soft/40 text-muted-foreground hover:border-accent-deep hover:bg-sage-soft cursor-pointer"
          >
            {value.length === 0 ? (
              <>
                <ImageIcon size={20} />
                <span className="text-[11px] font-medium">Browse media library</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span className="text-[11px] font-medium">Add more</span>
              </>
            )}
          </button>
        )}
      </div>

      <MediaLibraryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={(url) => {
          if (value.length + 1 > maxImages) {
            toast.error(`Maximum ${maxImages} images`)
            return
          }
          onChange([...value, url])
        }}
      />

      <p className="text-[10px] text-muted-foreground">
        {value.length} / {maxImages} images · drag to reorder · first image is shown as primary
      </p>
    </div>
  )
}
