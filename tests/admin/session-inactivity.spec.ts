import { test, expect } from '@playwright/test'
import { getTestUsers } from '../utils'

test.describe('Admin Session Inactivity Auto-Logout', () => {
  const admin = getTestUsers().find((u: any) => u.role === 'super_admin')

  test.beforeEach(async ({ page }) => {
    // We must initialize the clock BEFORE navigating so that all timers are hooked
    await page.clock.install({ time: new Date() })

    // Log in
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', admin.email)
    await page.fill('input[type="password"]', admin.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin*')
  })

  test('Warning modal appears at the 25-minute mark with countdown', async ({ page }) => {
    // Fast forward 24 minutes and 59 seconds
    await page.clock.fastForward(25 * 60 * 1000 - 1000)
    await expect(page.locator('text=Session Expiring Soon')).not.toBeVisible()

    // Fast forward to exactly 25 minutes
    await page.clock.fastForward(1000)
    await expect(page.locator('text=Session Expiring Soon')).toBeVisible()
    await expect(page.locator('text=You\'ll be logged out in 5:00')).toBeVisible()

    // Fast forward a few more seconds to see countdown tick
    await page.clock.fastForward(3000)
    await expect(page.locator('text=You\'ll be logged out in 4:57')).toBeVisible()
  })

  test('Clicking "Stay logged in" dismisses modal and resets timer', async ({ page }) => {
    // Fast forward to warning
    await page.clock.fastForward(25 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).toBeVisible()

    // Click "Stay logged in"
    await page.click('button:has-text("Stay logged in")')
    await expect(page.locator('text=Session Expiring Soon')).not.toBeVisible()

    // Fast forward another 24 minutes, should still be invisible
    await page.clock.fastForward(24 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).not.toBeVisible()

    // Fast forward to 25 minutes since click
    await page.clock.fastForward(1 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).toBeVisible()
  })

  test('No interaction after warning logs out at 30 minutes', async ({ page }) => {
    // Fast forward to warning
    await page.clock.fastForward(25 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).toBeVisible()

    // Fast forward to exactly 30 minutes
    await page.clock.fastForward(5 * 60 * 1000)

    // Should redirect to login
    await page.waitForURL('**/admin/login*')
    expect(page.url()).toContain('/admin/login?reason=inactivity')
    await expect(page.locator('text=You were logged out due to inactivity')).toBeVisible()
  })

  test('Activity before 25-minute mark prevents warning', async ({ page }) => {
    // Fast forward 15 minutes
    await page.clock.fastForward(15 * 60 * 1000)
    
    // Simulate activity (click anywhere)
    await page.mouse.click(0, 0)

    // Fast forward another 15 minutes (Total 30 mins since page load)
    // If timer didn't reset, we'd be logged out. But since we clicked,
    // it's only been 15 mins since last activity.
    await page.clock.fastForward(15 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).not.toBeVisible()

    // Fast forward another 10 minutes (Total 25 mins since click)
    await page.clock.fastForward(10 * 60 * 1000)
    await expect(page.locator('text=Session Expiring Soon')).toBeVisible()
  })

  test('Multi-tab sync logs out other tabs', async ({ context, page }) => {
    // We already have Tab A (page) logged in.
    const tabA = page
    await expect(tabA.locator('h1', { hasText: 'Dashboard' })).toBeVisible()

    // Open Tab B and navigate to admin
    const tabB = await context.newPage()
    // Install clock on tab B before navigating
    await tabB.clock.install({ time: new Date() })
    await tabB.goto('/admin')
    await expect(tabB.locator('h1', { hasText: 'Dashboard' })).toBeVisible()

    // Fast forward Tab A to 30 minutes
    await tabA.clock.fastForward(30 * 60 * 1000)

    // Tab A should redirect
    await tabA.waitForURL('**/admin/login*')
    expect(tabA.url()).toContain('reason=inactivity')

    // Since we use BroadcastChannel/localStorage, Tab B should also receive the message and redirect
    // We might need to give Tab B a moment to process the message/event
    await tabB.waitForURL('**/admin/login*', { timeout: 5000 })
    expect(tabB.url()).toContain('reason=inactivity')
    await expect(tabB.locator('text=You were logged out due to inactivity')).toBeVisible()
  })
})
