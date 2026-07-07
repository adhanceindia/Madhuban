'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/admin/shared/page-header'
import { RichTextEditor } from '@/components/admin/shared/rich-text-editor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { BlogPost, BlogCategory, BlogTag } from '@/db/schema/blog'

type Props = {
  initialData?: BlogPost & { tags?: BlogTag[] }
  categories: BlogCategory[]
  tags: BlogTag[]
}

export function BlogEditor({ initialData, categories, tags }: Props) {
  const router = useRouter()
  const isEditing = !!initialData

  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    cover_image: initialData?.cover_image || '',
    category_id: initialData?.category_id || '',
    is_published: initialData?.is_published || false,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    selectedTags: initialData?.tags?.map((t) => t.id) || [],
  })

  // Auto-generate slug from title if not editing
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }))
    }
  }, [formData.title, formData.slug, isEditing])

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required')
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/admin/blog/${initialData.id}` : '/api/admin/blog'
      const method = isEditing ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        tags: formData.selectedTags,
        published_at: formData.is_published && (!initialData?.published_at) ? new Date().toISOString() : initialData?.published_at,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save post')
      }

      toast.success(isEditing ? 'Post updated' : 'Post created')
      router.push('/admin/blog')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setFormData(prev => {
      const current = prev.selectedTags
      const updated = current.includes(tagId) 
        ? current.filter(id => id !== tagId)
        : [...current, tagId]
      return { ...prev, selectedTags: updated }
    })
  }

  return (
    <div className="max-w-[1000px] pb-24">
      <div className="mb-4">
        <Link href="/admin/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Blog
        </Link>
      </div>

      <PageHeader
        title={isEditing ? 'Edit Post' : 'New Post'}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-deep text-foreground font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 mt-6">
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Basic Info</h3>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-url-slug"
              />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary for listing pages..."
                rows={3}
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Content</h3>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
            />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">SEO Settings</h3>
            <div>
              <Label>SEO Title</Label>
              <Input
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                placeholder="Defaults to post title if empty"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.seo_title.length} / 60 characters</p>
            </div>
            <div>
              <Label>SEO Description</Label>
              <Textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                placeholder="Defaults to excerpt if empty"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.seo_description.length} / 160 characters</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Publishing</h3>
            <div className="flex items-center justify-between">
              <Label>Published Status</Label>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(c) => setFormData({ ...formData, is_published: c })}
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Media</h3>
            <div>
              <Label>Cover Image URL</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
              />
              {formData.cover_image && (
                <div className="mt-2 aspect-video rounded-md overflow-hidden bg-muted border border-border">
                  <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Taxonomy</h3>
            <div>
              <Label>Category</Label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      formData.selectedTags.includes(t.id)
                        ? 'bg-accent/20 border-accent text-accent-deep font-medium'
                        : 'bg-background border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
