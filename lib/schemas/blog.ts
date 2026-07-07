import { z } from 'zod'

export const blogCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().nullable(),
})

export const blogTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  slug: z.string().min(1, 'Slug is required'),
})

export const blogPostCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  author_id: z.number().int().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  is_published: z.boolean().default(false),
  published_at: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  tags: z.array(z.number().int()).optional(),
})

export const blogPostUpdateSchema = blogPostCreateSchema.partial()
