// Static marketing content for editorial pages. Production content, not placeholder data.
// Contact info (phone, email, address) in layout components comes from Payload CMS Content global.
// Only the editorial page structures (heroes, descriptions, features) live here.

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Home page types + data
// ---------------------------------------------------------------------------

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

export const homeHero: HomeHero = {
  eyebrow: 'Madhuban Garden Resort',
  subtitle:
    'Welcome to a peaceful garden retreat where restful stays, family celebrations, and unforgettable wedding moments feel naturally beautiful.',
  image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80',
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
  image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
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

// ---------------------------------------------------------------------------
// Wedding page
// ---------------------------------------------------------------------------

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

export const weddingPage: WeddingPage = {
  hero: {
    eyebrow: 'Signature Wedding Venue',
    title: 'Begin Your Forever at Madhuban Garden',
    subtitle:
      'Where lush green lawns, graceful venues, and heartfelt hosting come together for the kind of wedding memories families talk about for years.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
  },
  overview: {
    eyebrow: 'Venue Overview',
    title:
      'A wedding destination shaped for emotion, beauty, and effortless hosting.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80',
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
        'Styled floral concepts, stage dressing, lighting, and visual detailing to suit your family\u2019s taste.',
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
      src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      alt: 'Outdoor wedding ceremony aisle at Madhuban Garden Resort',
    },
    {
      src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
      alt: 'Wedding couple portrait in the resort lawns',
    },
    {
      src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
      alt: 'Decorative floral wedding details and intimate styling',
    },
    {
      src: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=800&q=80',
      alt: 'Banquet reception setup with premium lighting and tables',
    },
    {
      src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
      alt: 'Evening wedding lawn lighting across lush green premises',
    },
    {
      src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80',
      alt: 'Bridal seating and stage styling for a celebration at Madhuban',
    },
  ],
  reasons: [
    {
      icon: 'Trees',
      title: 'Lush Green Premises',
      description:
        'The resort\u2019s natural greenery gives every function a calm, expansive, and highly photogenic backdrop.',
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
    title: "Let\u2019s begin planning your day with care and clarity.",
    description:
      'Tell us about your date, guest count, and celebration vision. Our team will get back to you to discuss venue options, packages, and next steps.',
  },
  location: {
    eyebrow: 'Visit The Venue',
    title: 'Plan a walkthrough of Madhuban Garden Resort.',
    address: 'Madhuban Garden Resort, Agar Malwa District',
    region: 'Madhya Pradesh, India',
    note: 'Approximately 90 minutes from Ujjain, 2.5 hours from Indore, and 4 hours from Bhopal by road.',
  },
}

// ---------------------------------------------------------------------------
// Contact page
// ---------------------------------------------------------------------------

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

export const contactPage: ContactPage = {
  hero: {
    eyebrow: 'Contact The Resort',
    title: 'Get In Touch',
    subtitle:
      'Reach our team for room bookings, wedding walkthroughs, banquet enquiries, and celebration planning support at Madhuban Garden Resort.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80',
    overlayWord: 'Hello',
    chip: 'Call, email, or WhatsApp the Madhuban team',
  },
  introTitle: 'Speak with the team that helps shape stays and celebrations.',
  introDescription:
    'Whether you are planning a room stay, checking venue suitability, or exploring an event at the resort, we will help you choose the right next step.',
  channels: [
    {
      icon: 'Phone',
      label: 'Phone',
      value: '+91 73899 09985',
      href: 'tel:+917389909985',
    },
    {
      icon: 'Mail',
      label: 'Email',
      value: 'hello@madhubangarden.com',
      href: 'mailto:hello@madhubangarden.com',
    },
    {
      icon: 'MapPin',
      label: 'Address',
      value: 'Agar Malwa District, Madhya Pradesh, India',
    },
  ],
  mapTitle: 'Find Us',
  mapDescription:
    'Located on the Agar–Ujjain highway, Madhuban Garden Resort is a 90-minute drive from Ujjain and about 2.5 hours from Indore. Look for the resort signboard past the Agar town bypass.',
  formTitle: 'Send a resort query',
  formDescription:
    'Share what you are looking for and the team will guide you toward rooms, venues, events, or a general visit plan.',
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

// ---------------------------------------------------------------------------
// Gallery page
// ---------------------------------------------------------------------------

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

export const galleryPage: GalleryPage = {
  hero: {
    eyebrow: 'Visual Journal',
    title: 'Resort Gallery',
    subtitle:
      'Explore a curated look at rooms, wedding moods, celebrations, leisure spaces, and the green calm that defines Madhuban Garden Resort.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
    overlayWord: 'Moments',
    chip: 'Rooms, celebrations, dining, leisure, and atmosphere',
  },
  description:
    'A premium visual index of the resort experience, arranged across rooms, weddings, events, poolside leisure, and restaurant moments.',
}

// ---------------------------------------------------------------------------
// Banquet page
// ---------------------------------------------------------------------------

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

export const banquetPage: BanquetPage = {
  hero: {
    eyebrow: 'Indoor Celebration Venue',
    title: 'Banquet Hall',
    subtitle:
      'A polished indoor event space designed for wedding functions, conferences, and family celebrations that need comfort, flexibility, and dependable hosting.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
    overlayWord: 'Gather',
    chip: 'Elegant indoor hosting for up to 800 guests',
  },
  overviewTitle:
    'A hall that feels formal enough for receptions and flexible enough for every event in between.',
  overviewDescription: [
    'The Madhuban banquet hall is built for celebrations that need structure, comfort, and smooth guest movement. Its indoor format makes it especially useful for receptions, sangeet nights, conferences, and hosted family functions where timing and logistics matter.',
    'Because the hall sits within the wider resort environment, families can combine event hosting with accommodation, food coordination, and guest support in one place rather than splitting the experience across multiple vendors or venues.',
  ],
  overviewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
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
      src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      alt: 'Banquet hall entrance and lighting mood at Madhuban',
      title: 'Arrival View',
      caption:
        'A welcoming indoor event atmosphere from the first guest arrival.',
    },
    {
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      alt: 'Banquet interior styling at Madhuban Garden Resort',
      title: 'Interior Styling',
      caption: 'A refined indoor environment ready for formal celebrations.',
    },
    {
      src: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80',
      alt: 'Banquet seating and stage arrangement',
      title: 'Seating Layout',
      caption:
        'Configurable arrangements for celebrations, dining, and hosting.',
    },
    {
      src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80',
      alt: 'Banquet decor and hosted event setup',
      title: 'Decor Mood',
      caption: 'Warm interior finishes that support polished event styling.',
    },
  ],
  ctaTitle: 'Planning a banquet function at Madhuban?',
  ctaDescription:
    'Share your event date, guest count, and function type with the resort team to get started.',
}

// ---------------------------------------------------------------------------
// Pool page
// ---------------------------------------------------------------------------

export type PoolPage = {
  hero: RouteHero
  overviewTitle: string
  overviewDescription: string[]
  timings: string
  rules: string[]
  photos: MediaAsset[]
}

export const poolPage: PoolPage = {
  hero: {
    eyebrow: 'Leisure At The Resort',
    title: 'Swimming Pool',
    subtitle:
      'A calm open-air pool zone that adds relaxation, family leisure, and easy downtime to the Madhuban Garden Resort experience.',
    image: 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?auto=format&fit=crop&w=1600&q=80',
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
      src: 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?auto=format&fit=crop&w=800&q=80',
      alt: 'Swimming pool at Madhuban Garden Resort',
      title: 'Pool View',
      caption: 'An open resort leisure zone surrounded by greenery.',
    },
    {
      src: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=800&q=80',
      alt: 'Poolside deck and sitting area',
      title: 'Deck Seating',
      caption: 'Comfortable sitting areas for guests between swims and stays.',
    },
    {
      src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      alt: 'Evening pool atmosphere at Madhuban Garden Resort',
      title: 'Evening Mood',
      caption: 'Soft evening ambience for a more relaxed end to the day.',
    },
  ],
}

// ---------------------------------------------------------------------------
// Events page
// ---------------------------------------------------------------------------

export type EventsPage = {
  hero: RouteHero
  introTitle: string
  introDescription: string
  services: IconFeature[]
  ctaTitle: string
  ctaDescription: string
}

export const eventsPage: EventsPage = {
  hero: {
    eyebrow: 'Celebrations Beyond Weddings',
    title: 'Events & Celebrations',
    subtitle:
      'From birthdays and family gatherings to corporate meets and hosted functions, Madhuban helps smaller events feel thoughtful, polished, and easy to manage.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80',
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
    'Use the contact form to share your function type, date, and guest estimate.',
}

// ---------------------------------------------------------------------------
// Attractions page
// ---------------------------------------------------------------------------

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

export const attractions: Attraction[] = [
  {
    name: 'Maa Baglabukhi Temple',
    description:
      'A revered spiritual destination near Nalkheda, known for its sacred atmosphere and lasting cultural significance.',
    distance: '15 km from the resort',
    image: 'https://images.unsplash.com/photo-1609766857041-ed0703465262?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mahakaleshwar Temple',
    description:
      'The iconic Jyotirlinga temple in Ujjain, a meaningful day trip for guests exploring Madhya Pradesh.',
    distance: '65 km from the resort',
    image: 'https://images.unsplash.com/photo-1621427638996-d57d0c1b3a2c?auto=format&fit=crop&w=800&q=80',
  },
]

export const attractionsPage: AttractionsPage = {
  hero: {
    eyebrow: 'Nearby Attractions',
    title: 'Places Worth Visiting Near Madhuban',
    subtitle:
      'Turn a peaceful resort stay into a meaningful local journey with major temple destinations that families often include in their travel plans.',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80',
    overlayWord: 'Explore',
    chip: 'Stay at Madhuban and plan nearby spiritual day visits',
  },
  visitPlanTitle: 'Plan your visit with Madhuban as your calm base.',
  visitPlanDescription:
    'Guests often use the resort as a comfortable stay point while planning temple visits, family travel, or short regional trips. Pair your visit with rooms, meals, and a peaceful property atmosphere before and after the journey.',
}
