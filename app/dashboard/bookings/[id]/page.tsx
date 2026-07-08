import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Download, Search, HelpCircle } from 'lucide-react'

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for display based on UI reference
  const booking = {
    id: params.id,
    roomName: 'Luxury Garden Room',
    checkIn: '20 Dec 2025 (2:00 PM)',
    checkOut: '22 Dec 2025 (11:00 AM)',
    guests: '2 Adults',
    roomCharges: '₹12,000',
    taxes: '₹1,440',
    total: '₹13,440',
    paid: '₹13,440'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/bookings" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to bookings
        </Link>
        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Main Card */}
      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        {/* Full width image */}
        <div className="relative w-full h-[240px] md:h-[320px]">
          <Image 
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop" 
            alt="Room Image" 
            fill
            className="object-cover"
          />
        </div>

        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-border">
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">{booking.roomName}</h1>
              <p className="text-muted-foreground mt-1">Booking ID: <span className="font-medium text-foreground">#MGR-{booking.id}</span></p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-status-confirmed-bg text-status-confirmed text-xs font-bold rounded-full uppercase tracking-wider">
                ● Confirmed
              </span>
              <span className="px-4 py-1.5 bg-status-confirmed-bg text-status-confirmed text-xs font-bold rounded-full uppercase tracking-wider">
                ● Paid
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-8">
            {/* Stay Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Stay Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium text-foreground">{booking.checkIn}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium text-foreground">{booking.checkOut}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium text-foreground">{booking.guests}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium text-foreground">{booking.roomName}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Room Charges</span>
                  <span className="font-medium text-foreground">{booking.roomCharges}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="font-medium text-foreground">{booking.taxes}</span>
                </div>
                <div className="h-px w-full bg-border my-2"></div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="font-semibold text-foreground">{booking.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-medium text-status-confirmed">{booking.paid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-8 border-t border-border">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-border hover:bg-gray-50 font-medium flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              Download Invoice
            </Button>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-border hover:bg-gray-50 font-medium flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              Download Confirmation
            </Button>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-border hover:bg-gray-50 font-medium flex-1 sm:flex-none sm:ml-auto">
              <HelpCircle className="w-4 h-4 mr-2 text-muted-foreground" />
              Need Help?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
