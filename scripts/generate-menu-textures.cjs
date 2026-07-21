const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const outDir = path.join(__dirname, '../public/textures/menu')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const PAGE_WIDTH = 1280
const PAGE_HEIGHT = 1710 // roughly 3:4 aspect ratio (the model uses 1.28 w x 1.71 h)

const pages = [
  {
    id: 'cover',
    theme: 'dark',
    content: `
      <text x="50%" y="40%" font-family="serif" font-size="80" fill="#d4af37" text-anchor="middle" font-style="italic">Madhuban Garden Resort</text>
      <text x="50%" y="55%" font-family="sans-serif" font-size="50" fill="#ffffff" text-anchor="middle" letter-spacing="10">DINING MENU</text>
      <path d="M400,480 L880,480" stroke="#d4af37" stroke-width="4" />
    `
  },
  {
    id: 'welcome',
    theme: 'light',
    content: `
      <text x="50%" y="30%" font-family="serif" font-size="60" fill="#2e7d32" text-anchor="middle" font-style="italic">Welcome</text>
      <text x="50%" y="45%" font-family="sans-serif" font-size="30" fill="#333" text-anchor="middle">Experience the finest culinary</text>
      <text x="50%" y="50%" font-family="sans-serif" font-size="30" fill="#333" text-anchor="middle">delights in a lush, peaceful</text>
      <text x="50%" y="55%" font-family="sans-serif" font-size="30" fill="#333" text-anchor="middle">environment.</text>
    `
  },
  {
    id: 'breakfast',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Breakfast</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Poha &amp; Jalebi</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹150</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Aloo Paratha</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹180</text>
    `
  },
  {
    id: 'lunch',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Lunch</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Madhuban Special Thali</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹450</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Paneer Tikka Masala</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹320</text>
    `
  },
  {
    id: 'dinner',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Dinner</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Dal Makhani</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹280</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Malai Kofta</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹350</text>
    `
  },
  {
    id: 'snacks',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Snacks</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Veg Pakoda</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹180</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">French Fries</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹150</text>
    `
  },
  {
    id: 'beverages',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Beverages</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Masala Chai</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹50</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Fresh Lime Soda</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹90</text>
    `
  },
  {
    id: 'desserts',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Desserts</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Gulab Jamun</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹120</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Ice Cream Sundae</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹180</text>
    `
  },
  {
    id: 'specials',
    theme: 'light',
    content: `
      <text x="50%" y="20%" font-family="serif" font-size="70" fill="#2e7d32" text-anchor="middle" font-style="italic">Chef's Specials</text>
      <text x="20%" y="35%" font-family="sans-serif" font-size="35" fill="#111">Sizzler (Veg)</text>
      <text x="80%" y="35%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹550</text>
      <path d="M200,380 L1080,380" stroke="#e0e0e0" stroke-width="2" />
      <text x="20%" y="45%" font-family="sans-serif" font-size="35" fill="#111">Baked Macaroni</text>
      <text x="80%" y="45%" font-family="sans-serif" font-size="35" fill="#111" text-anchor="end">₹380</text>
    `
  },
  {
    id: 'backcover',
    theme: 'dark',
    content: `
      <text x="50%" y="85%" font-family="serif" font-size="40" fill="#d4af37" text-anchor="middle" font-style="italic">Thank You</text>
      <text x="50%" y="90%" font-family="sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">www.madhubangarden.com</text>
    `
  }
]

async function generate() {
  for (const page of pages) {
    const bg = page.theme === 'dark' ? '#111810' : '#fcfcfc'
    const border = page.theme === 'dark' ? '#d4af37' : '#2e7d32'
    
    const svg = `
      <svg width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="${bg}" />
        <rect x="50" y="50" width="${PAGE_WIDTH - 100}" height="${PAGE_HEIGHT - 100}" fill="none" stroke="${border}" stroke-width="4" />
        <rect x="65" y="65" width="${PAGE_WIDTH - 130}" height="${PAGE_HEIGHT - 130}" fill="none" stroke="${border}" stroke-width="1" />
        ${page.content}
      </svg>
    `

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(outDir, `${page.id}.jpg`))
    
    console.log(`Generated ${page.id}.jpg`)
  }

  // Roughness Map
  const roughnessSvg = `
    <svg width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.6" />
      <rect width="100%" height="100%" fill="#888888" opacity="0.4" />
    </svg>
  `
  await sharp(Buffer.from(roughnessSvg))
    .jpeg({ quality: 70 })
    .toFile(path.join(outDir, 'book-cover-roughness.jpg'))
  console.log('Generated book-cover-roughness.jpg')
}

generate().catch(console.error)
