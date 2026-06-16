/** @type {import('next').NextConfig} */

// CSP is shipped Report-Only first so it cannot break Razorpay/PhonePe/Cashfree
// checkout or Google Places. Watch the browser console for violations for ~1 week,
// then rename the header key to 'Content-Security-Policy' to enforce.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://mercury.phonepe.com https://sdk.cashfree.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.razorpay.com https://api.cashfree.com https://maps.googleapis.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://mercury.phonepe.com https://sdk.cashfree.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://secure.ccavenue.com https://secure.payu.in",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(self)' },
]

const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
