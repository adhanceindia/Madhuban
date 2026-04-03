import type { RoomData } from '@/lib/types'

export const roomFilters = ['All', 'Deluxe', 'Suite', 'Standard'] as const

export type RoomFilter = (typeof roomFilters)[number]

const DAY_IN_MS = 1000 * 60 * 60 * 24

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function parseDateInput(value: string) {
  if (!value) {
    return null
  }

  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function addDaysToDateInput(value: string, days: number) {
  const parsed = parseDateInput(value)

  if (!parsed) {
    return value
  }

  return formatDateInput(addDays(parsed, days))
}

export function calculateNights(checkIn: string, checkOut: string) {
  const start = parseDateInput(checkIn)
  const end = parseDateInput(checkOut)

  if (!start || !end) {
    return 0
  }

  const difference = end.getTime() - start.getTime()
  const nights = Math.round(difference / DAY_IN_MS)

  return nights > 0 ? nights : 0
}

export function formatIndianCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function getDefaultBookingDates(baseDate = new Date()) {
  const checkIn = addDays(baseDate, 1)
  const checkOut = addDays(baseDate, 2)

  return {
    checkIn: formatDateInput(checkIn),
    checkOut: formatDateInput(checkOut),
  }
}

export function getRoomGalleryImages(room: RoomData, minimum = 4) {
  if (room.images.length >= minimum) {
    return room.images.slice(0, minimum)
  }

  return Array.from({ length: minimum }, (_, index) => {
    const image = room.images[index % room.images.length]
    return image ?? room.images[0]
  })
}
