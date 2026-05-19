'use client'

import { DollarSign, Calendar, Gauge } from 'lucide-react'
import { Card } from '@/components/ui/card'

type KPIData = {
  total_revenue: number
  total_bookings: number
  occupancy_rate: number
  booked_rooms_today: number
  total_rooms: number
  confirmed_bookings: number
  pending_bookings: number
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function KPICards({ data }: { data: KPIData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-5 border-t-4 border-t-primary shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center mb-3">
          <DollarSign size={20} className="text-primary" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.total_revenue > 0 ? formatCurrency(data.total_revenue) : '₹0'}
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Total Revenue
        </div>
      </Card>

      <Card className="p-5 border-t-4 border-t-gold shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-gold-light flex items-center justify-center mb-3">
          <Calendar size={20} className="text-gold" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.total_bookings}
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Total Bookings
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {data.confirmed_bookings} confirmed, {data.pending_bookings} pending
        </div>
      </Card>

      <Card className="p-5 border-t-4 border-t-primary shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center mb-3">
          <Gauge size={20} className="text-primary" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.occupancy_rate}%
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Occupancy Rate
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {data.booked_rooms_today} of {data.total_rooms} rooms occupied today
        </div>
      </Card>
    </div>
  )
}
