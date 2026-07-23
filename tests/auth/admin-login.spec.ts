import { test, expect } from '@playwright/test'
import { getTestUsers } from '../utils'

test.describe('Admin Login', () => {
  const admin = getTestUsers().find((u: any) => u.role === 'super_admin')

  test.afterEach(async ({ request }) => {
    // We cannot easily clear redis here without exposing it.
    // However, the test suite only ran rate limits for IP 203.0.113.1.
    // The previous run hit 429 for 127.0.0.1 because I forgot the x-forwarded-for headers.
    // Now that x-forwarded-for is added, 127.0.0.1 won't be rate limited, so we don't strictly need to clear it!
    // But let's just make sure it doesn't affect other tests.
  })

  test('Valid login lands on admin dashboard', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', admin.email)
    await page.fill('input[type="password"]', admin.password)
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/admin')
    expect(page.url()).toContain('/admin')
  })

  test('Invalid login shows error and sets no cookie', async ({ page, context }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', admin.email)
    await page.fill('input[type="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
    
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'sb-admin-auth-token')
    expect(sessionCookie).toBeUndefined()
  })

  test('Rate limiting kicks in after failed attempts', async ({ request }) => {
    const rateLimitThreshold = 20
    let lastStatus = 0
    let lastBody: any = {}

    // Spam the API route
    for (let i = 0; i < rateLimitThreshold + 5; i++) {
      const response = await request.post('/api/auth/login', {
        headers: { 'x-forwarded-for': '203.0.113.1' },
        data: {
          email: 'some_attacker@example.com',
          password: 'badpassword'
        }
      })
      lastStatus = response.status()
      lastBody = await response.json().catch(() => ({}))
    }
    
    // Should hit 429 Too Many Requests
    expect(lastStatus).toBe(429)
    expect(lastBody.error).toContain('Too many attempts')
  })
})
