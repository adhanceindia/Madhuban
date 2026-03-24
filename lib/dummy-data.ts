export type Room = {
  id: number
  slug: string
  name: string
  type: 'Deluxe' | 'Suite' | 'Standard'
  description: string
  details: string[]
  price_per_night: number
  capacity: number
  bed_type: string
  size_sqft: number
  amenities: string[]
  images: string[]
}

export type Review = {
  guest_name: string
  rating: number
  text: string
  date: string
}

export type HomeHero = {
  eyebrow: string
  subtitle: string
  image: string
}

export type HighlightStat = {
  icon: string
  title: string
  description: string
}

export type Amenity = {
  icon: string
  label: string
}

export type Service = {
  icon: string
  title: string
  description: string
}

export type WeddingFeaturePoint = {
  icon: string
  label: string
  value: string
}

export type WeddingFeature = {
  badge: string
  title: string
  description: string
  image: string
  ctaLabel: string
  points: WeddingFeaturePoint[]
}

export type WeddingHero = {
  eyebrow: string
  title: string
  subtitle: string
  image: string
}

export type WeddingOverviewStat = {
  label: string
  value: string
}

export type WeddingOverview = {
  eyebrow: string
  title: string
  image: string
  description: string[]
  stats: WeddingOverviewStat[]
  points: string[]
}

export type WeddingServiceItem = {
  icon: string
  title: string
  description: string
}

export type WeddingGalleryImage = {
  src: string
  alt: string
}

export type WeddingReason = {
  icon: string
  title: string
  description: string
}

export type WeddingInquiryContent = {
  eyebrow: string
  title: string
  description: string
}

export type WeddingLocation = {
  eyebrow: string
  title: string
  address: string
  region: string
  note: string
}

export type WeddingPage = {
  hero: WeddingHero
  overview: WeddingOverview
  services: WeddingServiceItem[]
  gallery: WeddingGalleryImage[]
  reasons: WeddingReason[]
  inquiry: WeddingInquiryContent
  location: WeddingLocation
}

export type RouteHero = {
  eyebrow: string
  title: string
  subtitle: string
  image: string
  overlayWord?: string
  chip?: string
}

export type StatItem = {
  label: string
  value: string
}

export type IconFeature = {
  icon: string
  title: string
  description: string
}

export type MediaAsset = {
  src: string
  alt: string
  title?: string
  caption?: string
  size?: 'portrait' | 'landscape' | 'square'
}

export type ContactChannel = {
  icon: string
  label: string
  value: string
  href?: string
}

export type ContactPage = {
  hero: RouteHero
  introTitle: string
  introDescription: string
  channels: ContactChannel[]
  mapTitle: string
  mapDescription: string
  formTitle: string
  formDescription: string
  serviceInterestOptions: string[]
}

export type GalleryCategory =
  | 'rooms'
  | 'wedding'
  | 'events'
  | 'pool'
  | 'restaurant'

export type GalleryItem = MediaAsset & {
  category: GalleryCategory
}

export type GalleryPage = {
  hero: RouteHero
  description: string
}

export type BanquetFacility = {
  icon: string
  label: string
}

export type BanquetPage = {
  hero: RouteHero
  overviewTitle: string
  overviewDescription: string[]
  overviewImage: string
  stats: StatItem[]
  facilities: BanquetFacility[]
  useCases: IconFeature[]
  photos: MediaAsset[]
  ctaTitle: string
  ctaDescription: string
}

export type PoolPage = {
  hero: RouteHero
  overviewTitle: string
  overviewDescription: string[]
  timings: string
  rules: string[]
  photos: MediaAsset[]
}

export type EventsPage = {
  hero: RouteHero
  introTitle: string
  introDescription: string
  services: IconFeature[]
  ctaTitle: string
  ctaDescription: string
}

export type AttractionsPage = {
  hero: RouteHero
  visitPlanTitle: string
  visitPlanDescription: string
}

export type Attraction = {
  name: string
  description: string
  distance: string
  image: string
}

export const resort = {
  name: 'Madhuban Garden Resort',
  tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
  address: 'Agar Malwa District, Madhya Pradesh, India',
  phone: '+91 98765 43210',
  email: 'hello@madhubangarden.com',
  whatsapp: '+91 98765 43210',
  instagram: 'https://instagram.com/madhubangarden',
  facebook: 'https://facebook.com/madhubangarden',
}

export const homeHero: HomeHero = {
  eyebrow: 'Madhuban Garden Resort',
  subtitle:
    'Welcome to a peaceful garden retreat where restful stays, family celebrations, and unforgettable wedding moments feel naturally beautiful.',
  image: '/images/home-hero.svg',
}

export const highlights: HighlightStat[] = [
  {
    icon: 'BedDouble',
    title: '19 Rooms',
    description:
      'Comfort-first stays designed for couples, families, and wedding guests.',
  },
  {
    icon: 'PartyPopper',
    title: 'Banquet Hall',
    description:
      'A polished indoor venue ready for receptions, gatherings, and celebrations.',
  },
  {
    icon: 'Waves',
    title: 'Swimming Pool',
    description:
      'A refreshing resort escape that adds leisure to every stay and event.',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Restaurant',
    description:
      'Indoor and outdoor dining with warm hospitality and fresh surroundings.',
  },
]

export const rooms: Room[] = [
  {
    id: 1,
    slug: 'garden-deluxe-room',
    name: 'Garden Deluxe Room',
    type: 'Deluxe',
    description:
      'A calm, garden-facing room with airy interiors, premium furnishings, and a cozy layout for couples or solo travelers.',
    details: [
      'The Garden Deluxe Room is designed for quiet, restorative stays, with soft natural light, warm textures, and a polished layout that feels easy from the moment you step in. Its garden-facing setting keeps the experience peaceful and closely connected to the resort’s lush green grounds.',
      'Ideal for couples or solo guests, this room balances comfort with an elevated resort mood. It is a strong fit for weekend escapes, wedding guest stays, or anyone wanting a serene room with thoughtful essentials already in place.',
    ],
    price_per_night: 3200,
    capacity: 2,
    bed_type: '1 King Bed',
    size_sqft: 260,
    amenities: ['Garden View', 'Air Conditioning', 'Smart TV', 'Tea Counter'],
    images: [
      '/images/room-garden-deluxe.svg',
      '/images/room-garden-deluxe.svg',
    ],
  },
  {
    id: 2,
    slug: 'premium-deluxe-room',
    name: 'Premium Deluxe Room',
    type: 'Deluxe',
    description:
      'Designed for restful stays, this room includes elegant finishes, a spacious bath, and soft natural light throughout the day.',
    details: [
      'The Premium Deluxe Room brings together a more generous footprint, refined finishes, and a bright, calming atmosphere suited to longer leisure stays. Its layout feels airy and composed, while the bath and work-ready touches add practical comfort.',
      'This option works especially well for guests who want a little more room to settle in without stepping up to a suite. It is equally suited to resort holidays, business travel, and premium accommodation for event attendees.',
    ],
    price_per_night: 3800,
    capacity: 2,
    bed_type: '1 King Bed',
    size_sqft: 290,
    amenities: ['Pool Access', 'Wi-Fi', 'Work Desk', 'Wardrobe'],
    images: [
      '/images/room-premium-deluxe.svg',
      '/images/room-premium-deluxe.svg',
    ],
  },
  {
    id: 3,
    slug: 'family-suite',
    name: 'Family Suite',
    type: 'Suite',
    description:
      'A spacious suite made for families, with a warm sitting area, extra room to unwind, and a comfortable sleep setup.',
    details: [
      'The Family Suite is shaped around togetherness, with extra breathing room for parents, children, and small groups to stay comfortably under one roof. A welcoming sitting area creates an easy transition between rest, conversation, and downtime after a day around the resort.',
      'For family celebrations or longer leisure stays, the suite offers a more flexible setup than a standard room while keeping the same calm, nature-led feel. It is a dependable choice for guests who want comfort, convenience, and space to spread out.',
    ],
    price_per_night: 6200,
    capacity: 4,
    bed_type: '1 King Bed + 1 Sofa Bed',
    size_sqft: 420,
    amenities: [
      'Living Area',
      'Mini Fridge',
      'Balcony',
      'Complimentary Breakfast',
    ],
    images: ['/images/room-family-suite.svg', '/images/room-family-suite.svg'],
  },
  {
    id: 4,
    slug: 'wedding-suite',
    name: 'Wedding Suite',
    type: 'Suite',
    description:
      'An elevated suite with refined finishes, ideal for bridal prep, special celebrations, and premium guest stays.',
    details: [
      'The Wedding Suite is our most elevated stay category, created for milestone moments, premium hosting, and the kind of calm preparation a wedding day deserves. The suite’s generous proportions, dressing-ready zones, and polished finish make it especially fitting for bridal or family use.',
      'Beyond weddings, it also serves as a signature stay for VIP guests who want more privacy and a stronger sense of occasion. Every detail is tuned toward comfort, readiness, and a premium resort experience.',
    ],
    price_per_night: 7800,
    capacity: 4,
    bed_type: '1 King Bed + 1 Day Bed',
    size_sqft: 520,
    amenities: [
      'Dressing Area',
      'Premium Bath',
      'Garden Balcony',
      'Room Service',
    ],
    images: [
      '/images/room-wedding-suite.svg',
      '/images/room-wedding-suite.svg',
    ],
  },
  {
    id: 5,
    slug: 'standard-garden-room',
    name: 'Standard Garden Room',
    type: 'Standard',
    description:
      'A practical and comfortable room for short stays, featuring a clean layout and a peaceful resort atmosphere.',
    details: [
      'The Standard Garden Room keeps things simple in the best way, offering a clean, relaxed layout with easy access to the resort’s green surroundings. It is designed for short stays that still feel comfortable, fresh, and properly cared for.',
      'This room is a reliable choice for guests who value calm surroundings and essential convenience without needing extra space. It suits overnight stopovers, quick family visits, and budget-conscious resort stays.',
    ],
    price_per_night: 2500,
    capacity: 2,
    bed_type: '1 Queen Bed',
    size_sqft: 220,
    amenities: [
      'Garden Access',
      'Air Conditioning',
      'Hot Water',
      'Laundry Service',
    ],
    images: [
      '/images/room-standard-garden.svg',
      '/images/room-standard-garden.svg',
    ],
  },
  {
    id: 6,
    slug: 'standard-family-room',
    name: 'Standard Family Room',
    type: 'Standard',
    description:
      'A budget-friendly family option with enough space for a short holiday or an overnight resort stop.',
    details: [
      'The Standard Family Room is a practical option for smaller groups that want an affordable stay without compromising on comfort. Its bedding setup and extra flexibility make it well suited to families, wedding guests, and short leisure trips.',
      'With a straightforward layout and useful everyday amenities, this room is built to handle real travel needs while still feeling warm and welcoming. It is especially helpful for guests who want value and convenience in one package.',
    ],
    price_per_night: 4600,
    capacity: 3,
    bed_type: '1 Queen Bed + 1 Single Bed',
    size_sqft: 310,
    amenities: ['Extra Bed Option', 'TV', 'Cupboard Space', '24x7 Front Desk'],
    images: [
      '/images/room-standard-family.svg',
      '/images/room-standard-family.svg',
    ],
  },
]

export const reviews: Review[] = [
  {
    guest_name: 'Rahul Mehta',
    rating: 5,
    text: 'A peaceful property with lush surroundings and warm service. The rooms were clean and the overall experience felt premium.',
    date: '2026-02-12',
  },
  {
    guest_name: 'Sakshi Verma',
    rating: 5,
    text: 'We attended a family function here and loved the open green feel. The venue looked beautiful in photos and the food was excellent.',
    date: '2026-01-28',
  },
  {
    guest_name: 'Ankit Jain',
    rating: 4,
    text: 'Great place for a resort stay near Agar Malwa. Spacious, calm, and ideal for both weekend getaways and events.',
    date: '2025-12-19',
  },
]

export const amenities: Amenity[] = [
  { icon: 'CarFront', label: 'Parking' },
  { icon: 'Wifi', label: 'WiFi' },
  { icon: 'Sparkles', label: 'Laundry' },
  { icon: 'UtensilsCrossed', label: 'In-Room Dining' },
  { icon: 'Coffee', label: 'Breakfast' },
]

export const services: Service[] = [
  {
    icon: 'BedDouble',
    title: 'Hotel',
    description:
      'Comfortable rooms for calm stays, family visits, and wedding guests.',
  },
  {
    icon: 'PartyPopper',
    title: 'Banquet',
    description:
      'A flexible celebration venue for receptions, social events, and gatherings.',
  },
  {
    icon: 'ConciergeBell',
    title: 'Restaurant',
    description:
      'Indoor and outdoor dining with a fresh atmosphere and welcoming service.',
  },
  {
    icon: 'Waves',
    title: 'Pool',
    description:
      'A refreshing leisure space that complements relaxed resort stays.',
  },
  {
    icon: 'CalendarDays',
    title: 'Events',
    description:
      'Birthday parties, corporate meets, small celebrations, and curated functions.',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Catering',
    description:
      'Festive dining support for weddings, private gatherings, and hosted events.',
  },
]

export const weddingFeature: WeddingFeature = {
  badge: 'Signature Experience',
  title: 'Your Perfect Wedding Awaits',
  description:
    'Celebrate your biggest day in a setting that feels lush, intimate, and deeply memorable. Madhuban Garden Resort brings together expansive greenery, graceful event spaces, and warm hosting so every ritual feels beautifully cared for.',
  image: '/images/home-wedding.svg',
  ctaLabel: 'Plan Your Wedding',
  points: [
    {
      icon: 'Users',
      label: 'Capacity',
      value: 'Celebrations for up to 1,500 guests',
    },
    {
      icon: 'Trees',
      label: 'Indoor + Outdoor',
      value: 'Open lawns and covered venues for every ceremony',
    },
    {
      icon: 'UtensilsCrossed',
      label: 'Catering',
      value: 'Curated menus and festive dining coordination',
    },
    {
      icon: 'Sparkles',
      label: 'Decoration',
      value: 'Elegant decor styling with event support',
    },
  ],
}

export const weddingPage: WeddingPage = {
  hero: {
    eyebrow: 'Signature Wedding Venue',
    title: 'Begin Your Forever at Madhuban Garden',
    subtitle:
      'Where lush green lawns, graceful venues, and heartfelt hosting come together for the kind of wedding memories families talk about for years.',
    image: '/images/wedding-hero.svg',
  },
  overview: {
    eyebrow: 'Venue Overview',
    title:
      'A wedding destination shaped for emotion, beauty, and effortless hosting.',
    image: '/images/wedding-overview.svg',
    description: [
      'Madhuban Garden Resort brings together landscaped outdoor beauty and polished event-ready spaces, making it a natural fit for intimate ceremonies as well as large-format family celebrations. The setting feels lush, premium, and deeply welcoming from the very first arrival.',
      'With venue flexibility, guest accommodation, and an experienced support team in one place, families can celebrate without the stress of coordinating across multiple locations. The experience is designed to feel calm behind the scenes and unforgettable in every frame.',
    ],
    stats: [
      { label: 'Capacity', value: 'Up to 1,500 guests' },
      { label: 'Venue Options', value: 'Indoor hall + open lawn' },
      { label: 'Location', value: 'Agar Malwa District, MP' },
    ],
    points: [
      'Signature indoor and outdoor setups for every ceremony, from haldi to reception',
      'Comfortable room inventory for close family, VIP guests, and wedding parties',
      'Nature-rich premises that photograph beautifully across daytime and evening events',
      'A single venue team for food, decor, logistics, and guest coordination support',
    ],
  },
  services: [
    {
      icon: 'Building2',
      title: 'Banquet Hall',
      description:
        'An elegant indoor venue for receptions, sangeet nights, and climate-controlled celebrations.',
    },
    {
      icon: 'Trees',
      title: 'Lawn / Outdoor',
      description:
        'Open green wedding spaces ideal for pheras, welcome dinners, and grand evening gatherings.',
    },
    {
      icon: 'UtensilsCrossed',
      title: 'Catering',
      description:
        'Curated vegetarian menus, regional favorites, and festive service tailored to your event flow.',
    },
    {
      icon: 'Sparkles',
      title: 'Decoration',
      description:
        'Styled floral concepts, stage dressing, lighting, and visual detailing to suit your family’s taste.',
    },
    {
      icon: 'CalendarDays',
      title: 'Event Management',
      description:
        'On-ground coordination support to help ceremonies, entries, and guest movement feel seamless.',
    },
    {
      icon: 'BedDouble',
      title: 'Accommodation',
      description:
        'Comfortable stays for wedding families, close relatives, and guests who want everything in one place.',
    },
  ],
  gallery: [
    {
      src: '/images/wedding-gallery-1.svg',
      alt: 'Outdoor wedding ceremony aisle at Madhuban Garden Resort',
    },
    {
      src: '/images/wedding-gallery-2.svg',
      alt: 'Wedding couple portrait in the resort lawns',
    },
    {
      src: '/images/wedding-gallery-3.svg',
      alt: 'Decorative floral wedding details and intimate styling',
    },
    {
      src: '/images/wedding-gallery-4.svg',
      alt: 'Banquet reception setup with premium lighting and tables',
    },
    {
      src: '/images/wedding-gallery-5.svg',
      alt: 'Evening wedding lawn lighting across lush green premises',
    },
    {
      src: '/images/wedding-gallery-6.svg',
      alt: 'Bridal seating and stage styling for a celebration at Madhuban',
    },
  ],
  reasons: [
    {
      icon: 'Trees',
      title: 'Lush Green Premises',
      description:
        'The resort’s natural greenery gives every function a calm, expansive, and highly photogenic backdrop.',
    },
    {
      icon: 'Users',
      title: 'Experienced Team',
      description:
        'Our team understands family-led events and helps the experience stay warm, organized, and guest-friendly.',
    },
    {
      icon: 'Sparkles',
      title: 'Customizable Packages',
      description:
        'Decor, dining, ceremony flow, and guest stay arrangements can be shaped to fit your celebration style.',
    },
    {
      icon: 'MapPin',
      title: 'Prime Location',
      description:
        'Located in Agar Malwa District, the venue is easy for local families and destination-style guests alike.',
    },
  ],
  inquiry: {
    eyebrow: 'Wedding Enquiry',
    title: "Let's begin planning your day with care and clarity.",
    description:
      'Tell us about your date, guest count, and celebration vision. This is a front-end enquiry flow for client approval, so submissions currently show a dummy success state only.',
  },
  location: {
    eyebrow: 'Visit The Venue',
    title: 'Plan a walkthrough of Madhuban Garden Resort.',
    address: 'Madhuban Garden Resort, Agar Malwa District',
    region: 'Madhya Pradesh, India',
    note: 'Google Maps integration will be added in the final implementation. For now, this section is a premium placeholder for the future embed.',
  },
}

export const contactPage: ContactPage = {
  hero: {
    eyebrow: 'Contact The Resort',
    title: 'Get In Touch',
    subtitle:
      'Reach our team for room bookings, wedding walkthroughs, banquet enquiries, and celebration planning support at Madhuban Garden Resort.',
    image: '/images/home-hero.svg',
    overlayWord: 'Hello',
    chip: 'Call, email, or WhatsApp the Madhuban team',
  },
  introTitle: 'Speak with the team that helps shape stays and celebrations.',
  introDescription:
    'Whether you are planning a room stay, checking venue suitability, or exploring an event at the resort, we will help you choose the right next step. This contact experience is UI-only for now and does not submit to a live backend.',
  channels: [
    {
      icon: 'Phone',
      label: 'Phone',
      value: resort.phone,
      href: `tel:${resort.phone.replace(/\s+/g, '')}`,
    },
    {
      icon: 'Mail',
      label: 'Email',
      value: resort.email,
      href: `mailto:${resort.email}`,
    },
    {
      icon: 'MapPin',
      label: 'Address',
      value: resort.address,
    },
  ],
  mapTitle: 'Google Maps embed placeholder',
  mapDescription:
    'The live map embed will be added once the final location pin and client-approved Google Maps configuration are ready.',
  formTitle: 'Send a resort query',
  formDescription:
    'Share what you are looking for and the team will be able to guide you toward rooms, venues, events, or a general visit plan in the final implementation.',
  serviceInterestOptions: [
    'Wedding Venue',
    'Rooms & Stays',
    'Banquet Hall',
    'Pool Access',
    'Events & Parties',
    'Restaurant',
    'General Enquiry',
  ],
}

export const galleryPage: GalleryPage = {
  hero: {
    eyebrow: 'Visual Journal',
    title: 'Resort Gallery',
    subtitle:
      'Explore a curated look at rooms, wedding moods, celebrations, leisure spaces, and the green calm that defines Madhuban Garden Resort.',
    image: '/images/gallery-hero.svg',
    overlayWord: 'Moments',
    chip: 'Rooms, celebrations, dining, leisure, and atmosphere',
  },
  description:
    'A premium visual index of the resort experience, arranged across rooms, weddings, events, poolside leisure, and restaurant moments.',
}

export const galleryItems: GalleryItem[] = [
  {
    src: '/images/room-garden-deluxe.svg',
    alt: 'Garden Deluxe Room interior at Madhuban Garden Resort',
    title: 'Garden Deluxe Room',
    caption: 'Soft, calm interiors with a garden-facing stay experience.',
    category: 'rooms',
    size: 'portrait',
  },
  {
    src: '/images/room-premium-deluxe.svg',
    alt: 'Premium Deluxe Room view at Madhuban Garden Resort',
    title: 'Premium Deluxe',
    caption: 'A brighter, more polished room layout for premium stays.',
    category: 'rooms',
    size: 'landscape',
  },
  {
    src: '/images/room-family-suite.svg',
    alt: 'Family Suite interior and lounge space',
    title: 'Family Suite',
    caption: 'A spacious room profile suited to families and wedding groups.',
    category: 'rooms',
    size: 'portrait',
  },
  {
    src: '/images/room-wedding-suite.svg',
    alt: 'Wedding Suite details at Madhuban Garden Resort',
    title: 'Wedding Suite',
    caption: 'An elevated suite for bridal readiness and premium hosting.',
    category: 'rooms',
    size: 'landscape',
  },
  {
    src: '/images/wedding-gallery-1.svg',
    alt: 'Wedding aisle styling at Madhuban Garden Resort',
    title: 'Ceremony Lawn',
    caption: 'Open-air ceremony styling framed by greenery and soft decor.',
    category: 'wedding',
    size: 'portrait',
  },
  {
    src: '/images/wedding-gallery-2.svg',
    alt: 'Wedding portrait setting in resort lawns',
    title: 'Wedding Portraits',
    caption: 'Natural backdrops that keep the celebration visually timeless.',
    category: 'wedding',
    size: 'portrait',
  },
  {
    src: '/images/wedding-gallery-4.svg',
    alt: 'Wedding reception hall styling at Madhuban',
    title: 'Reception Setup',
    caption: 'Elegant indoor celebration styling for evening functions.',
    category: 'wedding',
    size: 'square',
  },
  {
    src: '/images/wedding-gallery-6.svg',
    alt: 'Decorated stage at Madhuban Garden Resort',
    title: 'Stage Styling',
    caption: 'A warm and polished event setting for meaningful family moments.',
    category: 'wedding',
    size: 'landscape',
  },
  {
    src: '/images/events-1.svg',
    alt: 'Birthday party atmosphere at Madhuban Garden Resort',
    title: 'Birthday Celebrations',
    caption:
      'Smaller celebrations with decor, dining, and guest comfort in one place.',
    category: 'events',
    size: 'square',
  },
  {
    src: '/images/events-2.svg',
    alt: 'Corporate meet setup in a banquet-style hall',
    title: 'Corporate Meets',
    caption:
      'Conference-friendly layouts for team events and business gatherings.',
    category: 'events',
    size: 'landscape',
  },
  {
    src: '/images/events-3.svg',
    alt: 'Intimate event setting at Madhuban Garden Resort',
    title: 'Small Gatherings',
    caption: 'Social functions that feel warm, premium, and easy to host.',
    category: 'events',
    size: 'portrait',
  },
  {
    src: '/images/pool-1.svg',
    alt: 'Swimming pool at Madhuban Garden Resort',
    title: 'Poolside Leisure',
    caption:
      'A relaxed resort zone for leisure hours between stays and events.',
    category: 'pool',
    size: 'landscape',
  },
  {
    src: '/images/pool-2.svg',
    alt: 'Pool deck and sitting area at Madhuban',
    title: 'Pool Deck',
    caption: 'Comfortable seating and open-air ambience by the water.',
    category: 'pool',
    size: 'portrait',
  },
  {
    src: '/images/restaurant-1.svg',
    alt: 'Indoor restaurant setting at Madhuban Garden Resort',
    title: 'Indoor Dining',
    caption: 'A calm dining environment for hosted meals and everyday stays.',
    category: 'restaurant',
    size: 'square',
  },
  {
    src: '/images/restaurant-2.svg',
    alt: 'Open-air restaurant seating surrounded by greenery',
    title: 'Outdoor Dining',
    caption: 'Fresh air, greenery, and warm hospitality in an open setting.',
    category: 'restaurant',
    size: 'landscape',
  },
]

export const banquetPage: BanquetPage = {
  hero: {
    eyebrow: 'Indoor Celebration Venue',
    title: 'Banquet Hall',
    subtitle:
      'A polished indoor event space designed for wedding functions, conferences, and family celebrations that need comfort, flexibility, and dependable hosting.',
    image: '/images/banquet-1.svg',
    overlayWord: 'Gather',
    chip: 'Elegant indoor hosting for up to 800 guests',
  },
  overviewTitle:
    'A hall that feels formal enough for receptions and flexible enough for every event in between.',
  overviewDescription: [
    'The Madhuban banquet hall is built for celebrations that need structure, comfort, and smooth guest movement. Its indoor format makes it especially useful for receptions, sangeet nights, conferences, and hosted family functions where timing and logistics matter.',
    'Because the hall sits within the wider resort environment, families can combine event hosting with accommodation, food coordination, and guest support in one place rather than splitting the experience across multiple vendors or venues.',
  ],
  overviewImage: '/images/banquet-2.svg',
  stats: [
    { label: 'Capacity', value: '800 guests' },
    { label: 'Dimensions', value: '110 ft x 70 ft' },
    { label: 'Format', value: 'Indoor air-conditioned hall' },
  ],
  facilities: [
    { icon: 'AirVent', label: 'Fully air-conditioned' },
    { icon: 'Building2', label: 'Defined stage area' },
    { icon: 'Users', label: 'Flexible seating layouts' },
    { icon: 'BatteryCharging', label: 'Power backup' },
    { icon: 'UtensilsCrossed', label: 'Dining support' },
    { icon: 'CarFront', label: 'Guest parking' },
    { icon: 'Bath', label: 'Washroom access' },
  ],
  useCases: [
    {
      icon: 'PartyPopper',
      title: 'Weddings',
      description:
        'Ideal for receptions, sangeet functions, engagement ceremonies, and family-led pre-wedding events.',
    },
    {
      icon: 'BriefcaseBusiness',
      title: 'Conferences',
      description:
        'A practical indoor option for business meetings, training sessions, and institutional gatherings.',
    },
    {
      icon: 'Sparkles',
      title: 'Parties',
      description:
        'Well suited to anniversaries, birthdays, hosted dinners, and larger social celebrations.',
    },
  ],
  photos: [
    {
      src: '/images/banquet-1.svg',
      alt: 'Banquet hall entrance and lighting mood at Madhuban',
      title: 'Arrival View',
      caption:
        'A welcoming indoor event atmosphere from the first guest arrival.',
    },
    {
      src: '/images/banquet-2.svg',
      alt: 'Banquet interior styling at Madhuban Garden Resort',
      title: 'Interior Styling',
      caption: 'A refined indoor environment ready for formal celebrations.',
    },
    {
      src: '/images/banquet-3.svg',
      alt: 'Banquet seating and stage arrangement',
      title: 'Seating Layout',
      caption:
        'Configurable arrangements for celebrations, dining, and hosting.',
    },
    {
      src: '/images/banquet-4.svg',
      alt: 'Banquet decor and hosted event setup',
      title: 'Decor Mood',
      caption: 'Warm interior finishes that support polished event styling.',
    },
  ],
  ctaTitle: 'Planning a banquet function at Madhuban?',
  ctaDescription:
    'Share your event date, guest count, and function type with the resort team and we can shape the right next step in the final enquiry flow.',
}

export const poolPage: PoolPage = {
  hero: {
    eyebrow: 'Leisure At The Resort',
    title: 'Swimming Pool',
    subtitle:
      'A calm open-air pool zone that adds relaxation, family leisure, and easy downtime to the Madhuban Garden Resort experience.',
    image: '/images/pool-1.svg',
    overlayWord: 'Leisure',
    chip: 'Open daily from 8:00 AM to 8:00 PM',
  },
  overviewTitle:
    'A refreshing poolside space that keeps resort time light, easy, and family-friendly.',
  overviewDescription: [
    'The swimming pool adds a leisure layer to the resort experience, giving families, couples, and event guests a comfortable space to relax between functions and room time. It is designed to feel open, maintained, and naturally connected to the green surroundings.',
    'Whether guests want a short break in the afternoon or a calmer stretch of downtime during a longer stay, the pool zone supports that slower resort rhythm without feeling disconnected from the rest of the property.',
  ],
  timings: '8:00 AM - 8:00 PM',
  rules: [
    'Children must be supervised by an adult at all times.',
    'Proper swimwear is required inside the pool.',
    'Please shower before entering the pool area.',
    'No glassware is allowed in or around the pool.',
    'Outside food is not permitted in the pool zone.',
  ],
  photos: [
    {
      src: '/images/pool-1.svg',
      alt: 'Swimming pool at Madhuban Garden Resort',
      title: 'Pool View',
      caption: 'An open resort leisure zone surrounded by greenery.',
    },
    {
      src: '/images/pool-2.svg',
      alt: 'Poolside deck and sitting area',
      title: 'Deck Seating',
      caption: 'Comfortable sitting areas for guests between swims and stays.',
    },
    {
      src: '/images/pool-3.svg',
      alt: 'Evening pool atmosphere at Madhuban Garden Resort',
      title: 'Evening Mood',
      caption: 'Soft evening ambience for a more relaxed end to the day.',
    },
  ],
}

export const eventsPage: EventsPage = {
  hero: {
    eyebrow: 'Celebrations Beyond Weddings',
    title: 'Events & Celebrations',
    subtitle:
      'From birthdays and family gatherings to corporate meets and hosted functions, Madhuban helps smaller events feel thoughtful, polished, and easy to manage.',
    image: '/images/events-1.svg',
    overlayWord: 'Celebrate',
    chip: 'Birthday parties, gatherings, business events, and catered functions',
  },
  introTitle:
    'Event support designed for families, teams, and hosted social occasions.',
  introDescription:
    'Madhuban Garden Resort is not only a wedding destination. It also supports smaller-format events that still need venue coordination, food, decor, and a guest-friendly environment. The result is a celebration space that feels premium without becoming difficult to manage.',
  services: [
    {
      icon: 'PartyPopper',
      title: 'Birthday Parties',
      description:
        'Celebrate birthdays in a relaxed resort setting with decor, food, and guest comfort handled in one place.',
    },
    {
      icon: 'BriefcaseBusiness',
      title: 'Corporate Meets',
      description:
        'Use the resort for conferences, business gatherings, presentations, and hosted team events.',
    },
    {
      icon: 'Users',
      title: 'Small Gatherings',
      description:
        'Host anniversaries, family dinners, reunions, and intimate social functions with ease.',
    },
    {
      icon: 'UtensilsCrossed',
      title: 'Catering',
      description:
        'Curated dining support for event flows that require taste, timing, and smooth service.',
    },
    {
      icon: 'Sparkles',
      title: 'Decoration',
      description:
        'Light decor styling and visual setup support to make smaller events feel considered and complete.',
    },
  ],
  ctaTitle: 'Need help planning an event at Madhuban?',
  ctaDescription:
    'Use the contact form to share your function type, date, and guest estimate. The final implementation will route it to the appropriate event enquiry workflow.',
}

export const attractions: Attraction[] = [
  {
    name: 'Maa Baglabukhi Temple',
    description:
      'A revered spiritual destination near Nalkheda, known for its sacred atmosphere and lasting cultural significance.',
    distance: '15 km from the resort',
    image: '/images/attraction-baglabukhi.svg',
  },
  {
    name: 'Mahakaleshwar Temple',
    description:
      'The iconic Jyotirlinga temple in Ujjain, a meaningful day trip for guests exploring Madhya Pradesh.',
    distance: '65 km from the resort',
    image: '/images/attraction-mahakaleshwar.svg',
  },
]

export const attractionsPage: AttractionsPage = {
  hero: {
    eyebrow: 'Nearby Attractions',
    title: 'Places Worth Visiting Near Madhuban',
    subtitle:
      'Turn a peaceful resort stay into a meaningful local journey with major temple destinations that families often include in their travel plans.',
    image: '/images/attractions-hero.svg',
    overlayWord: 'Explore',
    chip: 'Stay at Madhuban and plan nearby spiritual day visits',
  },
  visitPlanTitle: 'Plan your visit with Madhuban as your calm base.',
  visitPlanDescription:
    'Guests often use the resort as a comfortable stay point while planning temple visits, family travel, or short regional trips. Pair your visit with rooms, meals, and a peaceful property atmosphere before and after the journey.',
}
