import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options: CookieOptions }

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })
    const pathname = request.nextUrl.pathname

    const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/reset-password')
    const isAdminAuthRoute = pathname === '/admin/login' || pathname === '/admin/reset-password'

    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isCustomerAuthRoute = pathname === '/login' || pathname === '/register'

    let context: 'admin' | 'customer' | null = null
    if (isAdminRoute || isAdminAuthRoute) {
      context = 'admin'
    } else if (isDashboardRoute || isCustomerAuthRoute) {
      context = 'customer'
    }

    if (context) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: `sb-${context}-auth-token`,
          },
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: CookieToSet[]) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (context === 'admin') {
        if (isAdminRoute && !user) {
          const url = request.nextUrl.clone()
          url.pathname = '/admin/login'
          url.searchParams.set('redirect', pathname)
          return NextResponse.redirect(url)
        }
        if (isAdminAuthRoute && user) {
          const url = request.nextUrl.clone()
          url.pathname = '/admin'
          return NextResponse.redirect(url)
        }
      } else if (context === 'customer') {
        if (isDashboardRoute && !user) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('redirect', pathname)
          return NextResponse.redirect(url)
        }
        if (isCustomerAuthRoute && user) {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('[Middleware] Unhandled exception:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register', '/dashboard/:path*'],
}
