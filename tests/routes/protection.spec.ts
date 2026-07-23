import { test, expect } from '@playwright/test'
import { getTestUsers } from '../utils'

test.describe('Route Protection', () => {
  const testUsers = getTestUsers()
  const customer = testUsers.find((u: any) => u.role === 'customer')
  const admin = testUsers.find((u: any) => u.role === 'super_admin')

  const customerRoutes = ['/dashboard', '/dashboard/profile']
  const adminRoutes = [
    '/admin',
    '/admin/users',
    '/admin/settings',
    '/admin/inquiries',
    '/admin/rooms'
  ]

  test.describe('Unauthenticated Access', () => {
    for (const route of customerRoutes) {
      test(`Unauthenticated request to ${route} redirects to /login`, async ({ page }) => {
        await page.goto(route)
        await page.waitForURL('**/login*')
        expect(page.url()).toContain('/login')
        expect(page.url()).toContain(encodeURIComponent(route))
      })
    }

    for (const route of adminRoutes) {
      test(`Unauthenticated request to ${route} redirects to /admin/login`, async ({ page }) => {
        await page.goto(route)
        await page.waitForURL('**/admin/login*')
        expect(page.url()).toContain('/admin/login')
        expect(page.url()).toContain(encodeURIComponent(route))
      })
    }
  })

  test.describe('Authenticated as wrong role', () => {
    test('Customer accessing admin routes redirects to admin login', async ({ page }) => {
      // Login as customer
      await page.goto('/login')
      await page.fill('input[type="email"]', customer.email)
      await page.click('button[type="submit"]')
      
      await page.waitForSelector('text=Sign in with Password')
      await page.click('text=Sign in with Password')
      
      await page.waitForSelector('input[type="password"]')
      await page.fill('input[type="password"]', customer.password)
      await page.click('button[type="submit"]')
      
      await page.waitForURL('**/dashboard*')

      // Now attempt to access admin routes
      for (const route of adminRoutes) {
        await page.goto(route)
        await page.waitForURL('**/admin/login*')
        expect(page.url()).toContain('/admin/login')
      }
    })

    test('Admin accessing customer routes redirects to customer login', async ({ page }) => {
      // Login as admin
      await page.goto('/admin/login')
      await page.fill('input[type="email"]', admin.email)
      await page.fill('input[type="password"]', admin.password)
      await page.click('button[type="submit"]')
      
      await page.waitForURL('**/admin*')

      // Now attempt to access customer routes
      // Assuming admin does NOT have a customer session cookie
      for (const route of customerRoutes) {
        await page.goto(route)
        await page.waitForURL('**/login*')
        expect(page.url()).toContain('/login')
      }
    })
  })
})
