import { getDb } from './db/client'
import { rooms, siteContent, bookings, blockedDates } from './db/schema'
import { eq } from 'drizzle-orm'

const allImages = [
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/5711330a-8c9c-47a1-8f70-744284753bab.jpg',
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/31f0f100-91f9-4639-afee-61642f11e991.jpg',
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/befcd73c-23c9-4240-bc6f-4f4afd3d974f.jpg',
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/77a3bf9b-f007-4b00-b2ab-55cb6e0b278e.jpg',
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/739579b9-1fc3-4de5-96bc-cbd868a919eb.jpg',
  'https://pub-7f05a45164f8438b92f04404bc57a8ae.r2.dev/General/a1687b7d-05e8-451a-a585-9603d86fd104.jpg'
]

const baseAmenities = [
  'Air Conditioning',
  'Smart TV',
  'High-Speed Wi-Fi',
  'Complimentary Mineral Water',
  'Wardrobe',
  'Work Desk',
  'Premium Mattress',
  'Fresh Linen',
  'Attached Bathroom',
  'Hot & Cold Water',
  'Shower',
  'Toiletries',
  'Towels'
]

const premiumAmenities = [...baseAmenities, 'Sofa Seating']

const newRooms = [
  {
    name: 'Premium Room',
    slug: 'premium-room',
    type: 'suite',
    price_per_night: 2500,
    room_size: '300 sq ft',
    bed_type: 'King Size Bed',
    capacity: 2,
    quantity: 1,
    extra_bed_price: 400,
    breakfast_included: true,
    description: '<p>A spacious premium room designed for guests seeking extra comfort and relaxation. Featuring elegant interiors, a king-size bed, sofa seating, modern amenities, and ample space, it is ideal for couples or business travellers looking for a premium stay.</p>',
    amenities: premiumAmenities,
    images: [allImages[0], allImages[1], allImages[2]],
    is_active: true
  },
  {
    name: 'Executive King Bed',
    slug: 'executive-king-bed',
    type: 'deluxe',
    price_per_night: 2000,
    room_size: '255 sq ft',
    bed_type: 'King Size Bed',
    capacity: 2,
    quantity: 7,
    extra_bed_price: 400,
    breakfast_included: true,
    description: '<p>A comfortable and well-appointed executive room featuring a king-size bed, contemporary interiors, and all essential amenities for a relaxing business or leisure stay.</p>',
    amenities: baseAmenities,
    images: [allImages[3], allImages[4]],
    is_active: true
  },
  {
    name: 'Executive Twin Bed',
    slug: 'executive-twin-bed',
    type: 'deluxe',
    price_per_night: 2000,
    room_size: '255 sq ft',
    bed_type: 'Twin Beds',
    capacity: 2,
    quantity: 4,
    extra_bed_price: 400,
    breakfast_included: true,
    description: '<p>Designed for friends, colleagues, or family members travelling together, the Executive Twin Room offers two comfortable twin beds along with modern amenities and a relaxing atmosphere.</p>',
    amenities: baseAmenities,
    images: [allImages[4], allImages[5]],
    is_active: true
  },
  {
    name: 'Triple Bed Room',
    slug: 'triple-bed-room',
    type: 'deluxe',
    price_per_night: 3000,
    room_size: '255 sq ft',
    bed_type: 'Triple Beds',
    capacity: 3,
    quantity: 2,
    extra_bed_price: 400,
    breakfast_included: true,
    description: '<p>Perfect for families and small groups, the Triple Bed Room offers generous space, three comfortable beds, and all modern conveniences for a pleasant and comfortable stay.</p>',
    amenities: baseAmenities,
    images: [allImages[5], allImages[0]],
    is_active: true
  }
]

async function run() {
  const db = getDb()
  
  await db.delete(bookings)
  await db.delete(blockedDates)
  await db.delete(rooms)
  
  for (const r of newRooms) {
    await db.insert(rooms).values(r as any)
  }
  
  const policies = {
    check_in_time: '12:00 PM',
    check_out_time: '10:00 AM',
    cancellation_policy: '<p>Flexible Booking Available.<br>Non-Refundable Booking Available.</p>',
    refund_policy: '<p>Refunds are subject to the chosen booking policy (Flexible or Non-Refundable).</p>',
    gst_percentage: '12'
  }
  
  const existingPolicies = await db.select().from(siteContent).where(eq(siteContent.page, 'hotel_policies'))
  if (existingPolicies.length > 0) {
    await db.update(siteContent).set({ content: policies }).where(eq(siteContent.page, 'hotel_policies'))
  } else {
    await db.insert(siteContent).values({ page: 'hotel_policies', content: policies })
  }
  
  console.log('Successfully populated rooms and policies.')
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })
