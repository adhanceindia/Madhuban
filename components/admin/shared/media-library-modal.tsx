/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Upload, Image as ImageIcon, Trash2, Copy, Check, Folder, FileText, Video, Filter, Grid, List, X } from 'lucide-react'
import toast from 'react-hot-toast'

type MediaItem = {
  id: number
  filename: string
  url: string
  alt: string
  size: number
  width: number
  height: number
  mime_type: string
  folder: string
  created_at: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (urls: string[]) => void
}

const FOLDERS = ['Rooms', 'Suites', 'Events', 'Restaurant', 'Pool', 'Spa & Wellness', 'General']

export function MediaLibraryModal({ open, onOpenChange, onSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  
  // Sidebar states
  const [activeTab, setActiveTab] = useState('All media') // All media, Images, Videos, Documents
  const [activeFolder, setActiveFolder] = useState<string>('')
  
  // Search and Sort
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('newest')
  
  // Filter states
  const [showFilters, setShowFilters] = useState(true)
  const [dateFilter, setDateFilter] = useState('any') // any, today, yesterday, 7days, 30days
  
  // Selection and UI
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaItem[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Stable fetch function that doesn't participate in effect dependencies.
  // This is called manually after upload/delete operations.
  const fetchMediaRef = useRef<(() => Promise<void>) | null>(null)

  // Single effect to load media when the modal is open and filters change.
  // Using all filter values directly as deps (instead of a useCallback identity)
  // prevents the identity-instability loop that occurs in React 19 Strict Mode.
  useEffect(() => {
    if (!open) {
      // Clear selections when modal closes — using functional update
      // so this only triggers a re-render if selected was non-empty.
      setSelected((prev) => (prev.length === 0 ? prev : []))
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function doFetch() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.append('search', debouncedSearch)
        if (activeFolder) params.append('folder', activeFolder)
        if (activeTab === 'Images') params.append('fileType', 'image')
        if (activeTab === 'Videos') params.append('fileType', 'video')
        if (activeTab === 'Documents') params.append('fileType', 'document')
        if (sort) params.append('sort', sort)

        const res = await fetch(`/api/admin/media?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (cancelled) return
        const data = await res.json()
        if (cancelled) return

        if (data.items) {
          let filteredItems = data.items

          // Client-side date filtering since our DB queries don't natively support dynamic dates yet
          if (dateFilter !== 'any') {
            const now = new Date()
            filteredItems = filteredItems.filter((item: MediaItem) => {
              const itemDate = new Date(item.created_at)
              const diffTime = Math.abs(now.getTime() - itemDate.getTime())
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              if (dateFilter === 'today') return diffDays <= 1
              if (dateFilter === 'yesterday') return diffDays > 1 && diffDays <= 2
              if (dateFilter === '7days') return diffDays <= 7
              if (dateFilter === '30days') return diffDays <= 30
              return true
            })
          }

          setItems(filteredItems)
        }
      } catch (err) {
        if (!cancelled) toast.error('Failed to load media')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    doFetch()

    // Expose the fetch function via ref so upload/delete handlers can refresh.
    fetchMediaRef.current = doFetch

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, debouncedSearch, activeFolder, activeTab, sort, dateFilter])

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setUploading(true)
    try {
      for (const file of fileArray) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', activeFolder || 'General')
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          toast.error(`Failed to upload ${file.name}`)
        }
      }
      toast.success('Upload complete')
      fetchMediaRef.current?.()
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
      setSelected((prev) => prev.filter(s => s.id !== id))
      fetchMediaRef.current?.()
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

  const toggleSelection = useCallback((item: MediaItem) => {
    setSelected((prev) => {
      if (prev.some(s => s.id === item.id)) {
        return prev.filter(s => s.id !== item.id)
      }
      return [...prev, item]
    })
  }, [])

  const handleInsert = () => {
    if (selected.length > 0) {
      onSelect(selected.map(s => s.url))
      onOpenChange(false)
    }
  }

  // Count metrics for sidebar (rough approximations based on loaded items for UX feel)
  const totalCount = items.length
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 sm:p-0 overflow-hidden bg-card rounded-2xl border-0 shadow-2xl">
        <div className="px-8 py-6 border-b border-border/40">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="font-display font-medium text-3xl text-primary-900 tracking-tight">
              Media Library
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Manage, upload, and organize your resort&apos;s visual assets.
            </p>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center gap-4 px-8 py-4 border-b border-border/30">
          <div className="flex bg-muted/50 p-1 rounded-lg">
            <button 
              className="px-4 py-1.5 rounded-md bg-card shadow-sm text-sm font-medium transition-all text-foreground"
            >
              Library
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-md text-muted-foreground text-sm font-medium hover:text-foreground transition-all flex items-center gap-2"
            >
              <Upload size={14} /> Upload new
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search media..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${showFilters ? 'bg-primary/10 border-primary/20 text-primary-dark' : 'bg-transparent border-border/50 text-muted-foreground hover:bg-muted/50'}`}
            >
              <Filter size={18} />
            </button>

            <div className="flex items-center gap-2 border border-border/50 rounded-lg px-3 py-1.5">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="text-sm bg-transparent outline-none cursor-pointer font-medium"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="flex border border-border/50 rounded-lg overflow-hidden bg-transparent">
              <button className="p-2 bg-muted text-foreground"><Grid size={16} /></button>
              <button className="p-2 text-muted-foreground hover:bg-muted/50 transition-colors"><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          {showFilters && (
            <div className="w-64 border-r border-border/30 overflow-y-auto flex flex-col hide-scrollbar bg-muted/10">
              <div className="p-4 space-y-0.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Library</h3>
                <SidebarItem 
                  icon={<ImageIcon size={16} />} label="All media" 
                  active={activeTab === 'All media'} count={totalCount}
                  onClick={() => setActiveTab('All media')} 
                />
                <SidebarItem 
                  icon={<ImageIcon size={16} />} label="Images" 
                  active={activeTab === 'Images'}
                  onClick={() => setActiveTab('Images')} 
                />
                <SidebarItem 
                  icon={<Video size={16} />} label="Videos" 
                  active={activeTab === 'Videos'}
                  onClick={() => setActiveTab('Videos')} 
                />
                <SidebarItem 
                  icon={<FileText size={16} />} label="Documents" 
                  active={activeTab === 'Documents'}
                  onClick={() => setActiveTab('Documents')} 
                />
              </div>

              <div className="px-4 py-2 space-y-0.5">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h3>
                </div>
                
                <SidebarItem 
                  icon={<Folder size={16} />} label="All Folders" 
                  active={activeFolder === ''}
                  onClick={() => setActiveFolder('')} 
                />
                {FOLDERS.map(folder => (
                  <SidebarItem 
                    key={folder}
                    icon={<Folder size={16} />} label={folder} 
                    active={activeFolder === folder}
                    onClick={() => setActiveFolder(folder)} 
                  />
                ))}
              </div>

              <div className="p-4 space-y-4 border-t border-border/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground">Filters</h3>
                  <button onClick={() => setDateFilter('any')} className="text-xs text-primary hover:underline">Clear all</button>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Date uploaded</h4>
                  <div className="space-y-2.5">
                    <Radio label="Any time" value="any" current={dateFilter} onChange={setDateFilter} />
                    <Radio label="Today" value="today" current={dateFilter} onChange={setDateFilter} />
                    <Radio label="Yesterday" value="yesterday" current={dateFilter} onChange={setDateFilter} />
                    <Radio label="Past 7 days" value="7days" current={dateFilter} onChange={setDateFilter} />
                    <Radio label="Past 30 days" value="30days" current={dateFilter} onChange={setDateFilter} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-card">
            {/* Grid Header Info */}
            <div className="px-8 py-4 flex items-center justify-between text-sm text-muted-foreground border-b border-transparent">
              <span className="font-medium text-foreground/80">{items.length} media item{items.length !== 1 && 's'}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-28">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <div className="p-6 bg-card rounded-full shadow-sm border border-border mb-2">
                    <ImageIcon size={48} className="text-muted" />
                  </div>
                  <p className="font-medium text-foreground">No media found</p>
                  <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map((item) => {
                    const isSelected = selected.some(s => s.id === item.id)
                    const isVideo = item.mime_type.startsWith('video/')
                    
                    return (
                      <div key={item.id} className="group relative">
                        <button
                          onClick={() => toggleSelection(item)}
                          className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all block bg-muted/20
                            ${isSelected ? 'border-primary ring-4 ring-primary/10 shadow-sm scale-[0.98]' : 'border-border/30 hover:border-primary/40 hover:shadow-md'}`}
                        >
                          {/* Inner Checkbox Indicator */}
                          <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all z-10
                            ${isSelected ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'border-white bg-black/20 opacity-0 group-hover:opacity-100 shadow-sm'}`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>

                          {isVideo ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                               <Video size={32} className="text-white/50" />
                               <span className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-1.5 rounded">Video</span>
                            </div>
                          ) : (
                            <Image src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width={400} height={400} />
                          )}
                          
                          {/* Overlay on select */}
                          {isSelected && <div className="absolute inset-0 bg-primary/10 pointer-events-none mix-blend-multiply" />}
                        </button>
                        
                        <div className="mt-2.5 flex flex-col px-1 gap-0.5">
                          <span className="text-[13px] font-medium text-foreground truncate" title={item.filename}>{item.filename}</span>
                          <span className="text-[11px] text-muted-foreground truncate font-medium">{formatBytes(item.size)} • {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/30 px-8 py-5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm">{selected.length} item{selected.length !== 1 && 's'} selected</span>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} className="text-sm text-primary hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2.5 rounded-lg border border-border/60 font-medium text-sm hover:bg-muted/50 transition-colors text-foreground shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInsert}
                  disabled={selected.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-deep transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Insert {selected.length > 0 ? selected.length : ''} media
                </button>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  )
}

function SidebarItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count?: number, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${
        active 
          ? 'bg-primary/10 text-primary-900 font-medium' 
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? 'bg-primary/10 text-primary-900 font-semibold' : 'bg-muted/50 group-hover:bg-muted-foreground/10'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function Radio({ label, value, current, onChange }: { label: string, value: string, current: string, onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${current === value ? 'border-primary' : 'border-border group-hover:border-primary/50'}`}>
        {current === value && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <span className={`text-sm ${current === value ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    </label>
  )
}
