export type Room = {
  id: number
  slug: string
  name: string
  type: 'Deluxe' | 'Suite' | 'Standard'
  description: string
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

export type Amenity = {
  icon: string
  label: string
}

export type Service = {
  icon: string
  title: string
  description: string
}

export const resort = {
  name: 'Madhuban Garden Resort',
  tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
  address:
    'Agar Malwa District, Madhya Pradesh, India',
  phone: '+91 98765 43210',
  email: 'hello@madhubangarden.com',
  whatsapp: '+91 98765 43210',
}

export const rooms: Room[] = [
  {
    id: 1,
    slug: 'garden-deluxe-room',
    name: 'Garden Deluxe Room',
    type: 'Deluxe',
    description:
      'A calm, garden-facing room with airy interiors, premium furnishings, and a cozy layout for couples or solo travelers.',
    price_per_night: 3200,
    capacity: 2,
    bed_type: '1 King Bed',
    size_sqft: 260,
    amenities: ['Garden View', 'Air Conditioning', 'Smart TV', 'Tea Counter'],
    images: ['/images/room-1.jpg', '/images/room-1-2.jpg'],
  },
  {
    id: 2,
    slug: 'premium-deluxe-room',
    name: 'Premium Deluxe Room',
    type: 'Deluxe',
    description:
      'Designed for restful stays, this room includes elegant finishes, a spacious bath, and soft natural light throughout the day.',
    price_per_night: 3800,
    capacity: 2,
    bed_type: '1 King Bed',
    size_sqft: 290,
    amenities: ['Pool Access', 'Wi-Fi', 'Work Desk', 'Wardrobe'],
    images: ['/images/room-2.jpg', '/images/room-2-2.jpg'],
  },
  {
    id: 3,
    slug: 'family-suite',
    name: 'Family Suite',
    type: 'Suite',
    description:
      'A spacious suite made for families, with a warm sitting area, extra room to unwind, and a comfortable sleep setup.',
    price_per_night: 6200,
    capacity: 4,
    bed_type: '1 King Bed + 1 Sofa Bed',
    size_sqft: 420,
    amenities: ['Living Area', 'Mini Fridge', 'Balcony', 'Complimentary Breakfast'],
    images: ['/images/room-3.jpg', '/images/room-3-2.jpg'],
  },
  {
    id: 4,
    slug: 'wedding-suite',
    name: 'Wedding Suite',
    type: 'Suite',
    description:
      'An elevated suite with refined finishes, ideal for bridal prep, special celebrations, and premium guest stays.',
    price_per_night: 7800,
    capacity: 4,
    bed_type: '1 King Bed + 1 Day Bed',
    size_sqft: 520,
    amenities: ['Dressing Area', 'Premium Bath', 'Garden Balcony', 'Room Service'],
    images: ['/images/room-4.jpg', '/images/room-4-2.jpg'],
  },
  {
    id: 5,
    slug: 'standard-garden-room',
    name: 'Standard Garden Room',
    type: 'Standard',
    description:
      'A practical and comfortable room for short stays, featuring a clean layout and a peaceful resort atmosphere.',
    price_per_night: 2500,
    capacity: 2,
    bed_type: '1 Queen Bed',
    size_sqft: 220,
    amenities: ['Garden Access', 'Air Conditioning', 'Hot Water', 'Laundry Service'],
    images: ['/images/room-5.jpg', '/images/room-5-2.jpg'],
  },
  {
    id: 6,
    slug: 'standard-family-room',
    name: 'Standard Family Room',
    type: 'Standard',
    description:
      'A budget-friendly family option with enough space for a short holiday or an overnight resort stop.',
    price_per_night: 4600,
    capacity: 3,
    bed_type: '1 Queen Bed + 1 Single Bed',
    size_sqft: 310,
    amenities: ['Extra Bed Option', 'TV', 'Cupboard Space', '24x7 Front Desk'],
    images: ['/images/room-6.jpg', '/images/room-6-2.jpg'],
  },
]

export const reviews: Review[] = [
  {
    guest_name: 'Rahul Mehta',
    rating: 5,
    text:
      'A peaceful property with lush surroundings and warm service. The rooms were clean and the overall experience felt premium.',
    date: '2026-02-12',
  },
  {
    guest_name: 'Sakshi Verma',
    rating: 5,
    text:
      'We attended a family function here and loved the open green feel. The venue looked beautiful in photos and the food was excellent.',
    date: '2026-01-28',
  },
  {
    guest_name: 'Ankit Jain',
    rating: 4,
    text:
      'Great place for a resort stay near Agar Malwa. Spacious, calm, and ideal for both weekend getaways and events.',
    date: '2025-12-19',
  },
]

export const amenities: Amenity[] = [
  { icon: 'CarFront', label: 'Indoor Parking' },
  { icon: 'Wifi', label: 'Free WiFi' },
  { icon: 'Sparkles', label: 'Laundry Service' },
  { icon: 'UtensilsCrossed', label: 'In-Room Dining' },
  { icon: 'Coffee', label: 'Complimentary Breakfast' },
]

export const services: Service[] = [
  {
    icon: 'BedDouble',
    title: 'Hotel Rooms',
    description: 'Comfortable stay options for couples, families, and event guests.',
  },
  {
    icon: 'PartyPopper',
    title: 'Banquet Hall',
    description: 'A flexible indoor venue for celebrations, gatherings, and receptions.',
  },
  {
    icon: 'ConciergeBell',
    title: 'Restaurant',
    description: 'Indoor and outdoor dining with a fresh resort atmosphere.',
  },
  {
    icon: 'Waves',
    title: 'Swimming Pool',
    description: 'A refreshing leisure space for relaxed resort stays.',
  },
  {
    icon: 'CalendarDays',
    title: 'Events',
    description: 'Birthday parties, corporate meets, small parties, and curated functions.',
  },
]
