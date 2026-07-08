import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, User, Users, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
            Welcome back, Yuvraj 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your stays</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl h-11 px-6 shadow-sm">
          Book a Stay
        </Button>
      </div>

      {/* Upcoming Stay Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Stay</h3>
        
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-[340px] h-48 md:h-auto shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop" 
                alt="Luxury Garden Room" 
                fill
                className="object-cover"
              />
            </div>
            
            {/* Details Section */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-display font-semibold text-foreground">Luxury Garden Room</h4>
                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1">Check-in</p>
                      <p className="font-medium text-foreground">20 Dec 2025</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1">Check-out</p>
                      <p className="font-medium text-foreground">22 Dec 2025</p>
                    </div>
                    <div className="flex items-end pb-[2px]">
                      <Users className="w-4 h-4 mr-1.5" />
                      <span>2 Guests</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-status-confirmed-bg text-status-confirmed text-xs font-semibold rounded-full">
                      ● Confirmed
                    </span>
                    <span className="px-3 py-1 bg-status-confirmed-bg text-status-confirmed text-xs font-semibold rounded-full">
                      ● Paid
                    </span>
                  </div>
                  <div className="mt-4 text-right">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Booking ID</p>
                    <p className="font-bold text-foreground">#MGR-12578</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button variant="outline" className="rounded-xl border-border hover:bg-gray-50 h-11 px-6 text-foreground" asChild>
                  <Link href="/dashboard/bookings/12578">View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
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
