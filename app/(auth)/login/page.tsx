'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react'

type AuthStep = 'email' | 'method' | 'otp' | 'password' | 'register' | 'success'

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')

  const renderHeader = () => (
    <div className="flex flex-col items-center justify-center mb-6">
      <h2 className="text-xl font-display font-bold text-primary">Madhuban</h2>
      <p className="text-xs tracking-widest text-muted-foreground uppercase mt-1">Garden Resort</p>
    </div>
  )

  const renderEmailStep = () => (
    <div className="w-full max-w-md">
      {/* Cover Image */}
      <div className="relative w-full h-64 rounded-t-3xl overflow-hidden mb-[-2rem] z-0">
        <Image 
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop" 
          alt="Resort Entrance" 
          fill 
          className="object-cover"
        />
      </div>
      
      {/* Card */}
      <Card className="relative z-10 w-full shadow-xl border-none rounded-[2rem] bg-white pt-6">
        <CardHeader className="text-center pb-2">
          {renderHeader()}
          <CardTitle className="text-3xl font-display text-foreground mt-4">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-transparent"
              required 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-8">
          <Button 
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" 
            onClick={() => setStep('method')}
          >
            Continue
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            New here? <button onClick={() => setStep('register')} className="text-foreground font-medium hover:underline">Create an account</button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )

  const renderMethodStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <CardHeader className="text-center pt-8">
        {renderHeader()}
        <CardTitle className="text-3xl font-display text-foreground mt-4">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Choose how you'd like to sign in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        <div className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{email || 'you@example.com'}</p>
          </div>
          <button onClick={() => setStep('email')} className="text-primary text-sm font-medium hover:underline">Edit</button>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-16 rounded-xl flex items-center justify-start px-6 border-border hover:bg-gray-50 gap-4"
            onClick={() => setStep('otp')}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground text-base">Continue with Email OTP</span>
              <span className="text-xs text-muted-foreground font-normal">We'll send a code to your email</span>
            </div>
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-16 rounded-xl flex items-center justify-start px-6 border-border hover:bg-gray-50 gap-4"
            onClick={() => setStep('password')}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground text-base">Sign in with Password</span>
            </div>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-8 pt-4">
        <p className="text-sm text-center text-muted-foreground">
          New here? <button onClick={() => setStep('register')} className="text-foreground font-medium hover:underline">Create an account</button>
        </p>
      </CardFooter>
    </Card>
  )

  const renderOTPStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => setStep('method')} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
      <CardHeader className="text-center pt-2">
        {renderHeader()}
        <CardTitle className="text-2xl font-display text-foreground mt-4 leading-tight">
          We've sent a 6-digit code<br/>to {email || 'you@example.com'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 mt-6">
        <div className="flex justify-between gap-2 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Input key={i} className="w-12 h-14 text-center text-xl font-medium rounded-xl border-border focus-visible:ring-primary" maxLength={1} />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Resend code in <span className="font-medium">00:45</span>
        </p>
      </CardContent>
      <CardFooter className="pb-8 px-6">
        <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" asChild>
          <Link href="/dashboard">Verify & Continue</Link>
        </Button>
      </CardFooter>
    </Card>
  )

  const renderPasswordStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => setStep('method')} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
      <CardHeader className="text-center pt-2">
        {renderHeader()}
        <CardTitle className="text-3xl font-display text-foreground mt-4">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in with your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-4 px-6">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" className="h-12 rounded-xl" />
        </div>
        <div className="flex justify-start">
          <button className="text-sm font-medium text-foreground hover:underline">Forgot password?</button>
        </div>
        <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" asChild>
          <Link href="/dashboard">Sign in</Link>
        </Button>
        
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl flex items-center justify-center border-border hover:bg-gray-50 gap-2"
          onClick={() => setStep('otp')}
        >
          <Mail className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Continue with Email OTP</span>
        </Button>
      </CardContent>
    </Card>
  )

  const renderRegisterStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => setStep('email')} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
      <CardHeader className="text-center pt-2">
        {renderHeader()}
        <CardTitle className="text-3xl font-display text-foreground mt-4">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 mt-4 px-6">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Full name</Label>
          <Input id="reg-name" type="text" placeholder="Yuvraj Singh" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-phone">Phone number</Label>
          <Input id="reg-phone" type="tel" placeholder="+91 98765 43210" className="h-12 rounded-xl" />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <input type="checkbox" id="terms" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the Terms & Conditions
          </label>
        </div>
      </CardContent>
      <CardFooter className="pb-8 px-6 pt-4">
        <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" onClick={() => setStep('success')}>
          Create Account
        </Button>
      </CardFooter>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <CardHeader className="text-center pt-12 pb-6">
        {renderHeader()}
        <div className="flex justify-center mt-8 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center relative">
            {/* Sparkles simulate */}
            <div className="absolute -top-2 -right-2 text-gold">✨</div>
            <div className="absolute -bottom-2 -left-2 text-gold">✨</div>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-display text-foreground mt-4 leading-tight">
          Welcome to<br/>Madhuban Garden Resort!
        </CardTitle>
        <CardDescription className="text-base mt-4 px-4">
          Your account is ready. You can now manage your bookings and profile.
        </CardDescription>
      </CardHeader>
      <CardFooter className="pb-12 px-6 pt-4">
        <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="w-full flex justify-center">
      {step === 'email' && renderEmailStep()}
      {step === 'method' && renderMethodStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'password' && renderPasswordStep()}
      {step === 'register' && renderRegisterStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  )
}
