
import { weddingPage, banquetPage, poolPage, eventsPage, attractionsPage, galleryPage, contactPage } from './page-content';

export const defaultWeddingBlocks = [
  {
    id: 'wedding-hero-1',
    type: 'editorial_hero',
    props: {
      eyebrow: weddingPage.hero.eyebrow,
      title: weddingPage.hero.title,
      subtitle: weddingPage.hero.subtitle,
      image: weddingPage.hero.image,
      overlayWord: 'Romance',
      minHeightClassName: 'min-h-[90svh]',
    }
  },
  {
    id: 'wedding-overview-1',
    type: 'editorial_overview',
    props: {
      eyebrow: weddingPage.overview.eyebrow,
      title: weddingPage.overview.title,
      image: weddingPage.overview.image,
      description1: weddingPage.overview.description[0],
      description2: weddingPage.overview.description[1],
      stats: weddingPage.overview.stats,
      points: weddingPage.overview.points,
      layout: 'image-left'
    }
  },
  {
    id: 'wedding-services-1',
    type: 'icon_features_grid',
    props: {
      eyebrow: 'What We Offer',
      title: 'Wedding services thoughtfully layered around your celebration.',
      description: 'Every function can be supported with venue planning, styling, guest comfort, and coordination help under one roof.',
      centered: true,
      columns: 3,
      features: weddingPage.services,
    }
  },
  {
    id: 'wedding-gallery-1',
    type: 'editorial_gallery',
    props: {
      title: 'A celebration set in nature',
      description: '',
      layout: 'strip',
      images: weddingPage.gallery,
    }
  },
  {
    id: 'wedding-why-1',
    type: 'icon_features_grid',
    props: {
      eyebrow: 'Why Madhuban',
      title: 'Why couples choose Madhuban Garden Resort',
      centered: true,
      columns: 4,
      features: weddingPage.reasons,
    }
  },
  {
    id: 'wedding-inquiry-1',
    type: 'editorial_cta',
    props: {
      eyebrow: 'Inquiry',
      title: 'Begin planning your wedding with us.',
      description: 'Share your tentative dates and guest count. Our venue team will get in touch with availability, package details, and tour scheduling.',
      primaryLabel: 'Check Availability',
      primaryHref: '/contact',
      secondaryLabel: 'View Rooms',
      secondaryHref: '/rooms'
    }
  }
];

export const defaultBanquetBlocks = [
  {
    id: 'banquet-hero-1',
    type: 'editorial_hero',
    props: {
      eyebrow: 'The Grand Hall',
      title: banquetPage.hero.title,
      subtitle: banquetPage.hero.subtitle,
      image: banquetPage.hero.image,
      overlayWord: 'Grandeur',
      minHeightClassName: 'min-h-[70svh]',
    }
  },
  {
    id: 'banquet-overview-1',
    type: 'editorial_overview',
    props: {
      eyebrow: 'Overview',
      title: banquetPage.overviewTitle,
      image: banquetPage.overviewImage,
      description1: banquetPage.overviewDescription[0],
      description2: banquetPage.overviewDescription[1],
      stats: banquetPage.stats,
      points: banquetPage.facilities.map((f: { label: string }) => f.label),
      layout: 'image-right'
    }
  },
  {
    id: 'banquet-use-cases-1',
    type: 'icon_features_grid',
    props: {
      eyebrow: 'Versatile Spaces',
      title: 'A space that adapts to your celebration.',
      description: 'The banquet hall is designed as a blank canvas, ready to be transformed for your specific event style and guest requirements.',
      centered: true,
      columns: 3,
      features: banquetPage.useCases,
    }
  },
  {
    id: 'banquet-gallery-1',
    type: 'editorial_gallery',
    props: {
      title: 'Gallery',
      description: 'Photos from our banquet hall',
      layout: 'grid',
      images: banquetPage.photos,
    }
  },
  {
    id: 'banquet-cta-1',
    type: 'editorial_cta',
    props: {
      eyebrow: 'Book The Hall',
      title: 'Reserve the banquet for your upcoming event.',
      description: 'Contact our events team to discuss your dates, guest count, and catering requirements.',
      primaryLabel: 'Request Quote',
      primaryHref: '/contact',
      secondaryLabel: 'View Weddings',
      secondaryHref: '/wedding'
    }
  }
];

export const defaultPoolBlocks = [
  {
    id: 'pool-hero-1',
    type: 'editorial_hero',
    props: {
      title: poolPage.hero.title,
      subtitle: poolPage.hero.subtitle,
      image: poolPage.hero.image,
      overlayWord: 'Refresh',
      minHeightClassName: 'min-h-[70svh]',
      ctaText: 'View Pool Rules',
      ctaLink: '#rules'
    }
  },
  {
    id: 'pool-overview-1',
    type: 'editorial_overview',
    props: {
      eyebrow: poolPage.overviewTitle,
      title: 'A refreshing escape within the resort.',
      description1: poolPage.overviewDescription[0],
      description2: poolPage.overviewDescription[1],
      stats: [{ label: 'Timings', value: poolPage.timings }],
      points: poolPage.rules,
      layout: 'image-left'
    }
  },
  {
    id: 'pool-gallery-1',
    type: 'editorial_gallery',
    props: {
      title: 'Poolside Views',
      description: 'Images of our pool and seating area',
      layout: 'strip',
      images: poolPage.photos,
    }
  }
];

export const defaultEventsBlocks = [
  {
    id: 'events-hero-1',
    type: 'editorial_hero',
    props: {
      title: eventsPage.hero.title,
      subtitle: eventsPage.hero.subtitle,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      overlayWord: 'Celebrate',
      minHeightClassName: 'min-h-[70svh]',
      ctaText: 'Plan Your Event',
      ctaLink: '#corporate-booking'
    }
  },
  {
    id: 'events-services-1',
    type: 'icon_features_grid',
    props: {
      eyebrow: 'Event Services',
      title: eventsPage.introTitle,
      description: eventsPage.introDescription,
      centered: false,
      columns: 3,
      features: eventsPage.services,
    }
  },
  {
    id: 'events-form-1',
    type: 'corporate_booking_form',
    props: {
      eyebrow: 'Corporate Booking',
      title: eventsPage.ctaTitle,
      description: eventsPage.ctaDescription,
    }
  }
];

export const defaultAttractionsBlocks = [
  {
    id: 'attractions-hero-1',
    type: 'editorial_hero',
    props: {
      title: attractionsPage.hero.title,
      subtitle: attractionsPage.hero.subtitle,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      overlayWord: 'Explore',
      minHeightClassName: 'min-h-[70svh]',
    }
  },
  {
    id: 'attractions-cta-1',
    type: 'editorial_cta',
    props: {
      eyebrow: 'Plan Your Visit',
      title: attractionsPage.visitPlanTitle,
      description: attractionsPage.visitPlanDescription,
      primaryLabel: 'Explore Rooms',
      primaryHref: '/rooms',
      secondaryLabel: 'Contact Us',
      secondaryHref: '/contact'
    }
  }
];

export const defaultGalleryBlocks = [
  {
    id: 'gallery-hero-1',
    type: 'editorial_hero',
    props: {
      title: galleryPage.hero.title,
      subtitle: galleryPage.hero.subtitle,
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      overlayWord: 'Visuals',
      minHeightClassName: 'min-h-[60svh]',
    }
  },
  {
    id: 'gallery-grid-1',
    type: 'editorial_gallery',
    props: {
      title: 'A visual look at rooms, celebrations, leisure, and the slower rhythm of Madhuban.',
      description: galleryPage.description,
      layout: 'grid',
      images: [
        { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', alt: 'Pool' }
      ]
    }
  }
];

export const defaultContactBlocks = [
  {
    id: 'contact-hero-1',
    type: 'editorial_hero',
    props: {
      title: contactPage.hero.title,
      subtitle: contactPage.hero.subtitle,
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      overlayWord: 'Connect',
      minHeightClassName: 'min-h-[60svh]',
    }
  },
  {
    id: 'contact-form-1',
    type: 'contact_form',
    props: {
      title: contactPage.formTitle,
      description: contactPage.formDescription,
    }
  }
];

export const defaultRoomsBlocks = [
  {
    id: 'rooms-hero-1',
    type: 'editorial_hero',
    props: {
      eyebrow: 'Peaceful resort stays in Agar Malwa',
      title: 'Our Rooms & Suites',
      subtitle: 'Discover six thoughtfully styled rooms built around restful comfort, lush views, and the calm, premium atmosphere that defines Madhuban Garden Resort.',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
      overlayWord: 'Comfort',
      minHeightClassName: 'min-h-[70svh]',
    }
  },
  {
    id: 'rooms-listing-1',
    type: 'rooms_listing',
    props: {}
  },
  {
    id: 'rooms-amenities-1',
    type: 'amenities',
    props: {
      items: [
        { label: 'Indoor Parking', icon: 'Car' },
        { label: 'Free WiFi', icon: 'Wifi' },
        { label: 'Laundry Service', icon: 'Shirt' },
        { label: 'In-Room Dining', icon: 'UtensilsCrossed' },
        { label: 'Complimentary Breakfast', icon: 'Coffee' }
      ]
    }
  }
];
