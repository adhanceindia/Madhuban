'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Upload, Image as ImageIcon, Trash2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

type MediaItem = {
  id: number
  filename: string
  url: string
  alt: string
  size: number
  width: number
  height: number
  created_at: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function MediaLibraryModal({ open, onOpenChange, onSelect }: Props) {
  const [activeTab, setActiveTab] = useState('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = async (query = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
      }
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && activeTab === 'library') {
      fetchMedia(search)
    }
  }, [open, activeTab, search])

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setUploading(true)
    try {
      for (const file of fileArray) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          toast.error(`Failed to upload ${file.name}`)
        }
      }
      toast.success('Upload complete')
      setActiveTab('library')
      fetchMedia(search)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media?')) return
    
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Deleted successfully')
      setSelected(null)
      fetchMedia(search)
    } catch {
      toast.error('Failed to delete media')
    }
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleInsert = () => {
    if (selected) {
      onSelect(selected.url)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-background/50">
          <DialogTitle className="not-italic text-xl">Media Library</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            {activeTab === 'library' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search media..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm w-64 focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          <TabsContent value="library" className="flex-1 flex overflow-hidden m-0 mt-4 border-t border-border/30">
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <ImageIcon size={48} className="opacity-20" />
                  <p>No media found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group bg-sage-soft ${selected?.id === item.id ? 'border-accent ring-2 ring-accent/20' : 'border-transparent hover:border-accent/50'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                      {selected?.id === item.id && (
                        <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            {selected && (
              <div className="w-80 border-l border-border/30 bg-sage-soft/10 p-6 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h3 className="font-semibold text-sm mb-4">Attachment Details</h3>
                  <div className="aspect-video rounded-md overflow-hidden bg-sage-soft mb-4 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.url} alt={selected.filename} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[13px] text-muted-foreground space-y-1.5 break-all">
                    <p className="font-medium text-foreground truncate" title={selected.filename}>{selected.filename}</p>
                    <p>{new Date(selected.created_at).toLocaleDateString()}</p>
                    <p>{formatBytes(selected.size)}</p>
                    {selected.width && selected.height && (
                      <p>{selected.width} × {selected.height} pixels</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/30">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selected.url)
                      toast.success('URL copied to clipboard')
                    }}
                    className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy size={14} /> Copy URL to clipboard
                  </button>
                  <button 
                    onClick={() => handleDelete(selected.id)}
                    className="flex items-center gap-2 text-[13px] text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Delete permanently
                  </button>
                </div>

                <div className="mt-auto pt-6 border-t border-border/30">
                  <button 
                    onClick={handleInsert}
                    className="w-full py-2.5 bg-accent hover:bg-accent-deep text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Insert Image
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center m-0 p-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
              }}
              disabled={uploading}
              className={`w-full max-w-2xl aspect-[2/1] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-colors ${
                uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-accent hover:bg-sage-soft/30'
              } border-border bg-sage-soft/10`}
            >
              {uploading ? (
                <>
                  <Upload size={32} className="animate-pulse text-accent" />
                  <p className="text-sm font-medium">Uploading to Media Library...</p>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-accent/10 text-accent mb-2">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">SVG, PNG, JPG or GIF (max. 20MB)</p>
                  </div>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
