import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, User, Users } from 'lucide-react'
import { getSession } from '@/lib/auth.ts'
import { getCustomerBookings } from '@/actions/dashboard.ts'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const userBookings = await getCustomerBookings()

  // Find the most recent upcoming or ongoing booking (checkout in the future)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const upcomingBooking = userBookings
    .filter((ub) => ub.booking.status !== 'cancelled')
    .find((ub) => new Date(ub.booking.check_out) >= now)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
            Welcome back, {session.name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your stays</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl h-11 px-6 shadow-sm" asChild>
          <Link href="/rooms">Book a Stay</Link>
        </Button>
      </div>

      {/* Upcoming Stay Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Stay</h3>
        
        {upcomingBooking ? (
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-[340px] h-48 md:h-auto shrink-0 bg-warm-sand">
                <Image 
                  src={upcomingBooking.room?.images?.[0] || "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop"} 
                  alt={upcomingBooking.room?.name || "Room Image"} 
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Details Section */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="text-2xl font-display font-semibold text-foreground">
                      {upcomingBooking.room?.name || "Resort Room"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-1">Check-in</p>
                        <p className="font-medium text-foreground">{formatDate(upcomingBooking.booking.check_in)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-1">Check-out</p>
                        <p className="font-medium text-foreground">{formatDate(upcomingBooking.booking.check_out)}</p>
                      </div>
                      <div className="flex items-end pb-[2px]">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{upcomingBooking.booking.guests_count} Guests</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        upcomingBooking.booking.status === 'confirmed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : upcomingBooking.booking.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        ● {upcomingBooking.booking.status}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        upcomingBooking.booking.payment_status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        ● {upcomingBooking.booking.payment_status}
                      </span>
                    </div>
                    <div className="mt-2 sm:text-right">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Booking ID</p>
                      <p className="font-bold text-foreground">#MGR-{upcomingBooking.booking.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button variant="outline" className="rounded-xl border-border hover:bg-gray-50 h-11 px-6 text-foreground" asChild>
                    <Link href={`/dashboard/bookings/${upcomingBooking.booking.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white p-8 md:p-12 text-center max-w-xl mx-auto mt-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-display font-semibold text-foreground mb-3">No upcoming stays</h4>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              You don&apos;t have any reservations scheduled. Start planning your next peaceful getaway at Madhuban Garden Resort.
            </p>
            <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl h-11 px-8 shadow-sm" asChild>
              <Link href="/rooms">Explore Rooms & Book</Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Link href="/dashboard/bookings">
          <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warm-sand flex items-center justify-center text-primary shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-[15px]">My Bookings</h4>
                <p className="text-xs text-muted-foreground mt-0.5">View all your bookings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/bookings">
          <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warm-sand flex items-center justify-center text-primary shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-[15px]">Invoices</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Download your invoices</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/profile">
          <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warm-sand flex items-center justify-center text-primary shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-[15px]">Profile</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your details</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
