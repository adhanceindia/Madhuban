import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, CreditCard, Bell as BellIcon, FileText } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'Your booking #MGR-12578 is confirmed.',
      time: '2 hours ago',
      icon: CheckCircle2,
      color: 'bg-status-confirmed-bg text-status-confirmed',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment of ₹13,440 received successfully.',
      time: '3 hours ago',
      icon: CreditCard,
      color: 'bg-status-confirmed-bg text-status-confirmed',
    },
    {
      id: 3,
      type: 'update',
      title: 'Your stay is coming up in 5 days.',
      time: '1 day ago',
      icon: BellIcon,
      color: 'bg-status-pending-bg text-status-pending',
    },
    {
      id: 4,
      type: 'invoice',
      title: 'Invoice for booking #MGR-11890 is available.',
      time: '10 Nov 2025',
      icon: FileText,
      color: 'bg-blue-50 text-blue-500',
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Notifications</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 space-x-2 border-b border-border w-full justify-start rounded-none pb-4 overflow-x-auto">
          <TabsTrigger 
            value="all" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="bookings" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="updates" 
            className="rounded-full px-5 py-2 text-[14px] data-[state=active]:bg-warm-sand data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-50 transition-colors border-none"
          >
            Updates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="bg-white rounded-[2rem] shadow-sm p-2">
            {notifications.map((notif, i) => (
              <div 
                key={notif.id} 
                className={`flex items-start md:items-center justify-between p-4 md:p-6 hover:bg-gray-50/50 transition-colors rounded-2xl ${
                  i !== notifications.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                    <notif.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[15px] text-foreground font-medium pr-4">{notif.title}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-1 md:mt-0">
                  {notif.time}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
