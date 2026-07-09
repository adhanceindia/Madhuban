import { getCustomerBookings } from '@/actions/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Search } from 'lucide-react'
import { getSession } from '@/lib/auth.ts'
import { redirect } from 'next/navigation'

export default async function BookingsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const bookings = await getCustomerBookings()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const upcoming = bookings.filter(b => b.booking.status === 'confirmed' && new Date(b.booking.check_in) >= today)
  const completed = bookings.filter(b => b.booking.status === 'confirmed' && new Date(b.booking.check_in) < today)
  const cancelled = bookings.filter(b => b.booking.status === 'cancelled')

  const BookingList = ({ items }: { items: typeof bookings }) => {
    if (items.length === 0) {
      return (
        <Card className="mt-6 border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="py-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-warm-sand flex items-center justify-center text-primary mb-4">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-xl font-display font-medium text-foreground">No bookings found</p>
            <p className="text-muted-foreground text-[15px] mt-2">
              You don&apos;t have any bookings in this category yet.
            </p>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <div className="grid gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {items.map(({ booking, room }) => (
          <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden group">
              <div className="flex flex-col sm:flex-row p-4 gap-6 items-center">
                {/* Thumbnail */}
                <div className="relative w-full sm:w-[160px] h-[110px] rounded-xl overflow-hidden shrink-0 bg-warm-sand">
                  <Image 
                    src={room?.images?.[0] || "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop"} 
                    alt={room?.name || "Room Thumbnail"} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Details */}
                <div className="flex-1 w-full flex flex-col justify-between h-[110px] py-1">
                  <div>
                    <h4 className="text-[17px] font-semibold text-foreground">{room?.name || "Luxury Garden Room"}</h4>
                    <p className="text-[14px] text-muted-foreground mt-1">
                      {format(new Date(booking.check_in), 'dd MMM')} — {format(new Date(booking.check_out), 'dd MMM yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' ? (
                        <>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
                            ● Confirmed
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
                            ● {booking.payment_status}
                          </span>
                        </>
                      ) : booking.status === 'cancelled' ? (
                        <>
                          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
                            ● Cancelled
                          </span>
                          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
                            ● {booking.payment_status}
                          </span>
                        </>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
                          ● Pending
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full tracking-wider">
                        #MGR-{booking.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow (Desktop) */}
                <div className="hidden sm:flex pr-2 items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">My Bookings</h1>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 space-x-2 border-b border-border w-full justify-start rounded-none pb-4 overflow-x-auto">
          <TabsTrigger 
            value="upcoming" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Cancelled
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            All
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-0">
          <BookingList items={upcoming} />
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          <BookingList items={completed} />
        </TabsContent>
        <TabsContent value="cancelled" className="mt-0">
          <BookingList items={cancelled} />
        </TabsContent>
        <TabsContent value="all" className="mt-0">
          <BookingList items={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
