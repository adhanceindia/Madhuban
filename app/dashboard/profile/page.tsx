import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth.ts'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession('customer')
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Personal Information */}
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className="text-lg font-semibold text-foreground">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full name</p>
                <p className="font-medium text-foreground text-[15px]">{session.name}</p>
              </div>
              <button className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-medium text-foreground text-[15px]">{session.email}</p>
              </div>
              <button className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                <p className="font-medium text-foreground text-[15px]">+91 98765 43210</p>
              </div>
              <button className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                <p className="font-medium text-foreground text-[15px]">Agar Malwa, Madhya Pradesh, India</p>
              </div>
              <button className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className="text-lg font-semibold text-foreground">Account & Security</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground text-[15px] mb-1">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" className="rounded-xl border-border h-9">Update</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground text-[15px] mb-1">Manage Email Preferences</p>
                <p className="text-sm text-muted-foreground">Choose what you want to receive</p>
              </div>
              <Button variant="outline" className="rounded-xl border-border h-9">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
