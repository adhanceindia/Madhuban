export function getTestUsers() {
  if (process.env.TEST_USERS) {
    return JSON.parse(process.env.TEST_USERS)
  }

  const runId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  return [
    {
      email: `playwright-ci-${runId}-customer@madhubangarden.com`,
      password: 'TestPassword123!',
      name: 'Test Customer',
      role: 'customer'
    },
    {
      email: `playwright-ci-${runId}-admin@madhubangarden.com`,
      password: 'TestPassword123!',
      name: 'Test Admin',
      role: 'super_admin'
    }
  ]
}
