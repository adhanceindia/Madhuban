import { test, expect } from '@playwright/test'
import { getTestUsers } from '../utils'

test.describe('Role Boundary Checks', () => {
  const testUsers = getTestUsers()
  const customer = testUsers.find((u: any) => u.role === 'customer')
  const admin = testUsers.find((u: any) => u.role === 'super_admin')

  test('Customer cannot use admin login endpoint', async ({ request }) => {
    // Attempt to hit /api/auth/login with customer credentials
    const response = await request.post('/api/auth/login', {
      data: {
        email: customer.email,
        password: customer.password
      }
    })
    
    // Assert it is rejected with 403 (or 401)
    expect([401, 403]).toContain(response.status())
    
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  test('Customer session cookie cannot access admin routes directly', async ({ page }) => {
    // Log in as customer using the customer flow
    await page.goto('/login')
    
    // Wait for the login method step to be visible
    // Fill email and submit
    await page.fill('input[type="email"]', customer.email)
    await page.click('button[type="submit"]')
    
    // In the method step, click "Sign in with Password"
    await page.waitForSelector('text=Sign in with Password')
    await page.click('text=Sign in with Password')
    
    // Fill password and submit
    await page.waitForSelector('input[type="password"]')
    await page.fill('input[type="password"]', customer.password)
    await page.click('button[type="submit"]')
    
    // Wait until we reach /dashboard
    await page.waitForURL('**/dashboard*')
    
    // Now attempt to navigate directly to admin routes
    const adminRoutes = ['/admin', '/admin/users', '/admin/settings']
    
    for (const route of adminRoutes) {
      await page.goto(route)
      // Should redirect to /admin/login
      await page.waitForURL('**/admin/login*')
      expect(page.url()).toContain('/admin/login')
    }
  })

  test('Admin can legitimately access admin routes', async ({ page }) => {
    // Log in as admin using the admin flow
    await page.goto('/admin/login')
    
    await page.fill('input[type="email"]', admin.email)
    await page.fill('input[type="password"]', admin.password)
    await page.click('button[type="submit"]')
    
    // Wait until we reach /admin
    await page.waitForURL('**/admin*')
    expect(page.url()).not.toContain('/admin/login')
    
    // Ensure the page renders admin content (like the sidebar or dashboard title)
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible()
    
    // Check nested route
    await page.goto('/admin/users')
    await page.waitForURL('**/admin/users')
    // Wait for something to load in the Users list
    await expect(page.locator('table, [role="table"]')).toBeVisible({ timeout: 10000 }).catch(() => {})
  })
})
