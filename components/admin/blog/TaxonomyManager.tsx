'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { BlogCategory, BlogTag } from '@/db/schema/blog'

export function TaxonomyManager() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])

  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')

  const [newTagName, setNewTagName] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')

  const loadData = () => {
    fetch('/api/admin/blog/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/admin/blog/tags').then(r => r.json()).then(d => setTags(d.tags || []))
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto generate slugs
  useEffect(() => {
    if (newCatName) setNewCatSlug(newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }, [newCatName])

  useEffect(() => {
    if (newTagName) setNewTagSlug(newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }, [newTagName])

  const createCategory = async () => {
    if (!newCatName || !newCatSlug) return toast.error('Name and Slug required')
    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, slug: newCatSlug })
      })
      if (!res.ok) throw new Error('Failed to create category')
      toast.success('Category created')
      setNewCatName('')
      setNewCatSlug('')
      loadData()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const createTag = async () => {
    if (!newTagName || !newTagSlug) return toast.error('Name and Slug required')
    try {
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, slug: newTagSlug })
      })
      if (!res.ok) throw new Error('Failed to create tag')
      toast.success('Tag created')
      setNewTagName('')
      setNewTagSlug('')
      loadData()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="max-w-[1000px] pb-24">
      <div className="mb-4">
        <Link href="/admin/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Blog
        </Link>
      </div>

      <PageHeader title="Categories & Tags" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Categories Section */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="font-semibold text-foreground text-lg mb-4">Categories</h3>
          
          <div className="flex gap-2 mb-6 items-end">
            <div className="flex-1 space-y-1">
              <Label>Name</Label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name" />
            </div>
            <div className="flex-1 space-y-1">
              <Label>Slug</Label>
              <Input value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} placeholder="slug" />
            </div>
            <Button onClick={createCategory} variant="default" className="bg-accent hover:bg-accent-deep"><Plus size={16} /> Add</Button>
          </div>

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="font-semibold text-foreground text-lg mb-4">Tags</h3>
          
          <div className="flex gap-2 mb-6 items-end">
            <div className="flex-1 space-y-1">
              <Label>Name</Label>
              <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag Name" />
            </div>
            <div className="flex-1 space-y-1">
              <Label>Slug</Label>
              <Input value={newTagSlug} onChange={(e) => setNewTagSlug(e.target.value)} placeholder="slug" />
            </div>
            <Button onClick={createTag} variant="default" className="bg-accent hover:bg-accent-deep"><Plus size={16} /> Add</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet.</p>
            ) : (
              tags.map(t => (
                <div key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full bg-background text-sm">
                  <span className="font-medium">{t.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
