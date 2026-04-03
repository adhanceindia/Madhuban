// Env is loaded by preload.cjs via --require flag
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Helper: build a Lexical richText JSON structure from a plain string.
 * Payload v3 uses Lexical editor, which expects a specific JSON format.
 */
function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const rooms = [
  {
    slug: 'standard-room',
    name: 'Standard Room',
    type: 'standard' as const,
    description: richText(
      'A comfortable and well-appointed room perfect for solo travellers or couples on a budget. Enjoy air-conditioned comfort with all essential amenities, overlooking the lush green lawns of Madhuban Garden Resort.',
    ),
    price_per_night: 2500,
    capacity: 2,
    bed_type: 'Double',
    room_size: '220 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Attached Bathroom' },
      { amenity: 'Complimentary Breakfast' },
    ],
    is_active: true,
  },
  {
    slug: 'deluxe-room',
    name: 'Deluxe Room',
    type: 'deluxe' as const,
    description: richText(
      'Spacious and elegantly furnished, the Deluxe Room offers a serene retreat with garden views. Features premium bedding, a work desk, and a well-appointed bathroom with hot water supply round the clock.',
    ),
    price_per_night: 3500,
    capacity: 2,
    bed_type: 'King',
    room_size: '300 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Mini Fridge' },
      { amenity: 'Room Service' },
      { amenity: 'Complimentary Breakfast' },
    ],
    is_active: true,
  },
  {
    slug: 'deluxe-double',
    name: 'Deluxe Double',
    type: 'deluxe' as const,
    description: richText(
      'Ideal for small families or friends travelling together, the Deluxe Double room features two comfortable beds with generous floor space. Wake up to natural light streaming through large windows with views of the resort gardens.',
    ),
    price_per_night: 4000,
    capacity: 3,
    bed_type: 'Twin Double',
    room_size: '350 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Mini Fridge' },
      { amenity: 'Extra Bedding Available' },
      { amenity: 'Room Service' },
      { amenity: 'Complimentary Breakfast' },
    ],
    is_active: true,
  },
  {
    slug: 'family-suite',
    name: 'Family Suite',
    type: 'suite' as const,
    description: richText(
      'Our spacious Family Suite is designed for families seeking comfort and togetherness. With a separate living area, ample storage, and a large bathroom, this suite ensures a memorable stay for the whole family amidst Agar Malwa\'s most peaceful resort.',
    ),
    price_per_night: 5500,
    capacity: 4,
    bed_type: 'King + Sofa Bed',
    room_size: '500 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Mini Fridge' },
      { amenity: 'Separate Living Area' },
      { amenity: 'Room Service' },
      { amenity: 'Complimentary Breakfast' },
      { amenity: 'In-Room Dining' },
    ],
    is_active: true,
  },
  {
    slug: 'premium-suite',
    name: 'Premium Suite',
    type: 'suite' as const,
    description: richText(
      'Experience luxury at its finest in our Premium Suite, featuring designer interiors and a private balcony overlooking the gardens. The suite includes a king-sized bed, premium toiletries, and an exclusive lounge area for ultimate relaxation.',
    ),
    price_per_night: 7000,
    capacity: 2,
    bed_type: 'King',
    room_size: '550 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Mini Bar' },
      { amenity: 'Private Balcony' },
      { amenity: 'Bathrobe & Slippers' },
      { amenity: 'Premium Toiletries' },
      { amenity: 'Room Service' },
      { amenity: 'Complimentary Breakfast' },
    ],
    is_active: true,
  },
  {
    slug: 'honeymoon-suite',
    name: 'Honeymoon Suite',
    type: 'suite' as const,
    description: richText(
      'Our most romantic accommodation, the Honeymoon Suite is perfect for newlyweds and couples celebrating special occasions. Enjoy a four-poster king bed, rose petal turndown service on request, and a private garden-view sit-out surrounded by the lush greenery of Madhuban.',
    ),
    price_per_night: 8500,
    capacity: 2,
    bed_type: 'King Four-Poster',
    room_size: '600 sq ft',
    amenities: [
      { amenity: 'Air Conditioning' },
      { amenity: 'Free WiFi' },
      { amenity: 'Flat-screen TV' },
      { amenity: 'Mini Bar' },
      { amenity: 'Private Sit-Out' },
      { amenity: 'Bathrobe & Slippers' },
      { amenity: 'Premium Toiletries' },
      { amenity: 'Room Service' },
      { amenity: 'Complimentary Breakfast' },
      { amenity: 'Welcome Fruit Basket' },
    ],
    is_active: true,
  },
]

const reviews = [
  {
    guest_name: 'Rajesh Sharma',
    rating: 5,
    review_text:
      'Absolutely loved our stay at Madhuban Garden Resort! The greenery around the property is breathtaking — it truly is the most peaceful place in Agar Malwa. Staff was warm and the food at the restaurant was excellent. Will definitely come back for a family event.',
    source: 'google' as const,
    is_published: true,
  },
  {
    guest_name: 'Priya Patel',
    rating: 5,
    review_text:
      'We celebrated our wedding anniversary here and it was magical. The room was spotless, the garden setting was beautiful, and the staff arranged a lovely candlelight dinner for us. Highly recommended for couples!',
    source: 'google' as const,
    is_published: true,
  },
  {
    guest_name: 'Amit Verma',
    rating: 4,
    review_text:
      'Great resort for a weekend getaway from Indore. The swimming pool is clean and well-maintained. Rooms are spacious and comfortable. The banquet hall is impressive — we are considering it for our sister\'s wedding reception.',
    source: 'google' as const,
    is_published: true,
  },
  {
    guest_name: 'Sunita Joshi',
    rating: 5,
    review_text:
      'Hosted our daughter\'s birthday party at Madhuban and everything was arranged perfectly. The outdoor restaurant area was perfect for the evening celebration. The catering team prepared amazing food and the kids loved the pool area. Thank you Madhuban team!',
    source: 'manual' as const,
    is_published: true,
  },
  {
    guest_name: 'Deepak Malviya',
    rating: 4,
    review_text:
      'Stayed here for two nights during a business trip to Agar. Very peaceful property away from the city noise. Free WiFi works well, complimentary breakfast is decent, and the in-room dining is prompt. Good value for money in this area.',
    source: 'google' as const,
    is_published: true,
  },
]

const contentGlobal = {
  hero: {
    tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
    hero_heading: 'Madhuban Garden Resort',
    hero_subtext:
      'Nestled in the heart of Agar Malwa, Madhuban Garden Resort is a premium destination for family stays, romantic getaways, grand weddings, and unforgettable celebrations. Experience the perfect blend of comfort, nature, and hospitality.',
  },
  wedding: {
    wedding_heading: 'Make your wedding unforgettable',
    wedding_description:
      'From intimate ceremonies to grand celebrations, Madhuban Garden Resort offers the perfect backdrop for your special day. Our lush green lawns, elegant banquet hall, and dedicated event management team will ensure every detail is taken care of — making your wedding truly unforgettable.',
  },
  contact: {
    contact_phone: '+91 XXXXX XXXXX',
    contact_email: 'info@madhubangarden.com',
    contact_address:
      'Madhuban Garden Resort, Agar Malwa District, Madhya Pradesh, India',
    whatsapp_number: '91XXXXXXXXXX',
  },
  social: {
    instagram_url: 'https://instagram.com/madhubangarden',
    facebook_url: 'https://facebook.com/madhubangarden',
  },
  ical: {
    bookingcom_ical_url: '',
    mmt_ical_url: '',
  },
}

async function seed() {
  console.log('🌱 Starting seed...\n')

  const payload = await getPayload({ config })

  // ── Rooms ──────────────────────────────────────────────────
  console.log('🏨 Seeding Rooms...')
  for (const room of rooms) {
    const existing = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: room.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`   ⏭  "${room.name}" already exists, skipping`)
      continue
    }

    await payload.create({ collection: 'rooms', data: room })
    console.log(`   ✅ Created "${room.name}"`)
  }

  // ── Reviews ────────────────────────────────────────────────
  console.log('\n⭐ Seeding Reviews...')
  for (const review of reviews) {
    const existing = await payload.find({
      collection: 'reviews',
      where: { guest_name: { equals: review.guest_name } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`   ⏭  Review by "${review.guest_name}" already exists, skipping`)
      continue
    }

    await payload.create({ collection: 'reviews', data: review })
    console.log(`   ✅ Created review by "${review.guest_name}"`)
  }

  // ── Content Global ─────────────────────────────────────────
  console.log('\n📝 Seeding Content global...')
  await payload.updateGlobal({ slug: 'content', data: contentGlobal })
  console.log('   ✅ Content global updated')

  console.log('\n🎉 Seed complete!\n')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
