import { config } from 'dotenv'
config({ path: '.env.local' })

import { getDb } from '../db/client'
import { siteContent } from '../db/schema'
import { eq } from 'drizzle-orm'

// A small utility script to seed the initial homepage blocks so the site doesn't look empty

async function seedBlocks() {
  const db = getDb()

  const defaultBlocks = [
    {
      id: 'hero-1',
      type: 'hero',
      props: {},
    },
    {
      id: 'highlights-1',
      type: 'highlights',
      props: {},
    },
    {
      id: 'wedding-feature-1',
      type: 'wedding_feature',
      props: {},
    },
    {
      id: 'featured-rooms-1',
      type: 'featured_rooms',
      props: {},
    },
    {
      id: 'core-services-1',
      type: 'core_services',
      props: {},
    },
    {
      id: 'amenities-1',
      type: 'amenities',
      props: {},
    },
    {
      id: 'instagram-feed-1',
      type: 'instagram_feed',
      props: {},
    },
    {
      id: 'reviews-1',
      type: 'reviews',
      props: {},
    },
    {
      id: 'attractions-1',
      type: 'attractions',
      props: {},
    },
  ]

  console.log('Fetching current general content...')
  
  const [row] = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.page, 'homepage'))
    .limit(1)

  if (row) {
    const existingContent = row.content as Record<string, unknown>
    
    // Only seed if homepage_blocks is missing or empty
    if (!existingContent.homepage_blocks || (Array.isArray(existingContent.homepage_blocks) && existingContent.homepage_blocks.length === 0)) {
      console.log('Seeding default homepage blocks...')
      
      const updatedContent = {
        ...existingContent,
        homepage_blocks: defaultBlocks,
      }
      
      await db
        .update(siteContent)
        .set({ content: updatedContent })
        .where(eq(siteContent.page, 'homepage'))
        
      console.log('Blocks seeded successfully!')
    } else {
      console.log('Blocks already exist. Skipping seed.')
    }
  } else {
    console.log('No homepage content found. Creating it...')
    await db.insert(siteContent).values({
      page: 'homepage',
      content: { homepage_blocks: defaultBlocks },
    })
    console.log('Blocks seeded successfully!')
  }
}

seedBlocks()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
