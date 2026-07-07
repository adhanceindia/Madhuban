export const navLinks = [
  { label: 'Rooms', href: '/rooms' },
  { label: 'Wedding', href: '/wedding' },
  { label: 'Banquet', href: '/banquet' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]

export const quickLinks = [
  { label: 'Homepage', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Wedding', href: '/wedding' },
  { label: 'Banquet', href: '/banquet' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]

export const serviceLinks = [
  { label: 'Hotel Rooms', href: '/rooms' },
  { label: 'Wedding Venue', href: '/wedding' },
  { label: 'Banquet Hall', href: '/banquet' },
  { label: 'Swimming Pool', href: '/pool' },
  { label: 'Events & Parties', href: '/events' },
  { label: 'Nearby Attractions', href: '/attractions' },
]

export const megaNavLinks = [
  {
    title: 'Stay With Us',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Rooms', href: '/rooms', description: 'Explore our 19 luxury rooms.' },
      { title: 'Swimming Pool', href: '/pool', description: 'Relax by our outdoor pool.' },
    ],
  },
  {
    title: 'Celebrations',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Wedding Venue', href: '/wedding', description: 'The perfect backdrop for your big day.' },
      { title: 'Banquet Hall', href: '/banquet', description: 'Premium indoor event spaces.' },
      { title: 'Events & Parties', href: '/events', description: 'Birthdays, anniversaries, and corporate meets.' },
    ],
  },
  {
    title: 'Discover Madhuban',
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800',
    items: [
      { title: 'Gallery', href: '/gallery', description: 'View our stunning resort photos.' },
      { title: 'Nearby Attractions', href: '/attractions', description: 'Explore Agar Malwa.' },
    ],
  },
]

export const defaultMegaMenuFlat = [
  { id: '1', label: 'Stay With Us', href: '#', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', parentId: null, sort_order: 0 },
  { id: '1-1', label: 'Rooms', href: '/rooms', description: 'Explore our 19 luxury rooms.', parentId: '1', sort_order: 1 },
  { id: '1-2', label: 'Swimming Pool', href: '/pool', description: 'Relax by our outdoor pool.', parentId: '1', sort_order: 2 },
  { id: '2', label: 'Celebrations', href: '#', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', parentId: null, sort_order: 3 },
  { id: '2-1', label: 'Wedding Venue', href: '/wedding', description: 'The perfect backdrop for your big day.', parentId: '2', sort_order: 4 },
  { id: '2-2', label: 'Banquet Hall', href: '/banquet', description: 'Premium indoor event spaces.', parentId: '2', sort_order: 5 },
  { id: '2-3', label: 'Events & Parties', href: '/events', description: 'Birthdays, anniversaries, and corporate meets.', parentId: '2', sort_order: 6 },
  { id: '3', label: 'Discover Madhuban', href: '#', image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800', parentId: null, sort_order: 7 },
  { id: '3-1', label: 'Gallery', href: '/gallery', description: 'View our stunning resort photos.', parentId: '3', sort_order: 8 },
  { id: '3-2', label: 'Nearby Attractions', href: '/attractions', description: 'Explore Agar Malwa.', parentId: '3', sort_order: 9 },
]
