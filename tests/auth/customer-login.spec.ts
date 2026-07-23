import { test, expect } from '@playwright/test'
import { getTestUsers } from '../utils'

test.describe('Customer Login', () => {
  const customer = getTestUsers().find((u: any) => u.role === 'customer')

  test('Valid password login lands on dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', customer.email)
    await page.click('button[type="submit"]')
    
    await page.waitForSelector('text=Sign in with Password')
    await page.click('text=Sign in with Password')
    
    await page.waitForSelector('input[type="password"]')
    await page.fill('input[type="password"]', customer.password)
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard*')
    expect(page.url()).toContain('/dashboard')
  })

  test('Invalid password shows error and sets no session cookie', async ({ page, context }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', customer.email)
    await page.click('button[type="submit"]')
    
    await page.waitForSelector('text=Sign in with Password')
    await page.click('text=Sign in with Password')
    
    await page.waitForSelector('input[type="password"]')
    await page.fill('input[type="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')
    
    // Assert error message
    await expect(page.getByRole('alert').filter({ hasText: /Invalid/i })).toContainText('Invalid login credentials')
    
    // Assert no cookie is set
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'sb-customer-auth-token')
    expect(sessionCookie).toBeUndefined()
  })

  test('Empty required fields block submit', async ({ page }) => {
    await page.goto('/login')
    // Click submit without filling email
    await page.click('button[type="submit"]')
    
    // HTML5 validation should block it, or we stay on the same page
    expect(page.url()).toContain('/login')
    await expect(page.locator('input[type="email"]:invalid')).toBeAttached()
  })
})
