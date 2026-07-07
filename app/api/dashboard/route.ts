import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardData } from '@/db/queries/dashboard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end params required' }, { status: 400 })
  }

  const data = await getDashboardData(start, end)
  return NextResponse.json(data)
}
