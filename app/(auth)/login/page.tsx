'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { checkUserExists, signInWithOtp, verifyOtp, signInWithPassword, signUp } from '@/actions/auth'

type AuthStep = 'email' | 'method' | 'otp' | 'password' | 'register' | 'success'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regTerms, setRegTerms] = useState(false)

  // OTP Verification field
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timer, setTimer] = useState(0)

  // Loading and Error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Timer countdown hook
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle email submit & check existence
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)
    try {
      const exists = await checkUserExists(email)
      if (exists) {
        setStep('method')
      } else {
        setError('No account found. You can create an account below.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle requesting OTP
  const handleRequestOtp = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithOtp(email)
      setStep('otp')
      setOtp(Array(6).fill(''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle verifying OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length < 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await verifyOtp(email, token)
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      router.push(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle password login
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signInWithPassword(email, password)
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      router.push(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect password or authentication error.')
    } finally {
      setLoading(false)
    }
  }

  // Handle signup/registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regTerms) {
      setError('You must agree to the Terms & Conditions to register.')
      return
    }
    if (!regName || !regPassword) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signUp(email, regPassword, regName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP inputs key movement controls
  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Move focus to next input
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^[0-9]{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      document.getElementById('otp-5')?.focus()
    }
  }

  const renderHeader = () => (
    <div className="flex flex-col items-center justify-center mb-6">
      <h2 className="text-xl font-display font-bold text-primary">Madhuban</h2>
      <p className="text-xs tracking-widest text-muted-foreground uppercase mt-1">Garden Resort</p>
    </div>
  )

  const renderError = () => (
    error && (
      <div role="alert" className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl text-center">
        {error}
      </div>
    )
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
        
        {renderError()}

        <form onSubmit={handleEmailSubmit}>
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
                disabled={loading}
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8">
            <Button 
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking account...
                </>
              ) : (
                'Continue'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              New here? <button type="button" onClick={() => { setError(null); setStep('register'); }} className="text-foreground font-medium hover:underline">Create an account</button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )

  const renderMethodStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <CardHeader className="text-center pt-8">
        {renderHeader()}
        <CardTitle className="text-3xl font-display text-foreground mt-4">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Choose how you&apos;d like to sign in
        </CardDescription>
      </CardHeader>
      
      {renderError()}

      <CardContent className="space-y-6 mt-4">
        <div className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{email || 'you@example.com'}</p>
          </div>
          <button onClick={() => { setError(null); setStep('email'); }} className="text-primary text-sm font-medium hover:underline">Edit</button>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-16 rounded-xl flex items-center justify-start px-6 border-border hover:bg-gray-50 gap-4"
            onClick={handleRequestOtp}
            disabled={loading}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-foreground text-base">Continue with Email OTP</span>
              <span className="text-xs text-muted-foreground font-normal">We&apos;ll send a code to your email</span>
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
            onClick={() => { setError(null); setStep('password'); }}
            disabled={loading}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
          New here? <button onClick={() => { setError(null); setStep('register'); }} className="text-foreground font-medium hover:underline">Create an account</button>
        </p>
      </CardFooter>
    </Card>
  )

  const renderOTPStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => { setError(null); setStep('method'); }} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
      <CardHeader className="text-center pt-2">
        {renderHeader()}
        <CardTitle className="text-2xl font-display text-foreground mt-4 leading-tight">
          We&apos;ve sent a 6-digit code<br/>to {email || 'you@example.com'}
        </CardTitle>
      </CardHeader>
      
      {renderError()}

      <form onSubmit={handleVerifyOtp}>
        <CardContent className="space-y-8 mt-6">
          <div className="flex justify-between gap-2 px-2">
            {otp.map((digit, i) => (
              <Input 
                key={i} 
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="w-12 h-14 text-center text-xl font-medium rounded-xl border-border focus-visible:ring-primary bg-transparent" 
                disabled={loading}
                required
              />
            ))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {timer > 0 ? (
              <p>Resend code in <span className="font-medium">{formatTimer(timer)}</span></p>
            ) : (
              <button 
                type="button" 
                onClick={handleRequestOtp} 
                className="text-primary font-medium hover:underline focus:outline-none"
                disabled={loading}
              >
                Resend verification code
              </button>
            )}
          </div>
        </CardContent>
        <CardFooter className="pb-8 px-6">
          <Button 
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )

  const renderPasswordStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => { setError(null); setStep('method'); }} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
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

      {renderError()}

      <form onSubmit={handlePasswordSignIn}>
        <CardContent className="space-y-6 mt-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl" 
              disabled={loading}
              required
            />
          </div>
          <div className="flex justify-start">
            <button type="button" className="text-sm font-medium text-foreground hover:underline">Forgot password?</button>
          </div>
          <Button 
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          
          <Button 
            type="button"
            variant="outline" 
            className="w-full h-12 rounded-xl flex items-center justify-center border-border hover:bg-gray-50 gap-2"
            onClick={handleRequestOtp}
            disabled={loading}
          >
            <Mail className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Continue with Email OTP</span>
          </Button>
        </CardContent>
      </form>
    </Card>
  )

  const renderRegisterStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <div className="pt-6 px-6">
        <button onClick={() => { setError(null); setStep('email'); }} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
      <CardHeader className="text-center pt-2">
        {renderHeader()}
        <CardTitle className="text-3xl font-display text-foreground mt-4">Create your account</CardTitle>
      </CardHeader>
      
      {renderError()}

      <form onSubmit={handleRegisterSubmit}>
        <CardContent className="space-y-4 mt-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-muted-foreground">Email address</Label>
            <Input 
              id="reg-email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-gray-50/50"
              disabled={loading}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-name">Full name</Label>
            <Input 
              id="reg-name" 
              type="text" 
              placeholder="Yuvraj Singh" 
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="h-12 rounded-xl" 
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-phone">Phone number (Optional)</Label>
            <Input 
              id="reg-phone" 
              type="tel" 
              placeholder="+91 98765 43210" 
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              className="h-12 rounded-xl" 
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input 
              id="reg-password" 
              type="password" 
              placeholder="••••••••" 
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="h-12 rounded-xl" 
              disabled={loading}
              required
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={regTerms}
              onChange={(e) => setRegTerms(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" 
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the Terms & Conditions
            </label>
          </div>
        </CardContent>
        <CardFooter className="pb-8 px-6 pt-4">
          <Button 
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md shadow-xl border-none rounded-[2rem] bg-white p-2">
      <CardHeader className="text-center pt-12 pb-6">
        {renderHeader()}
        <div className="flex justify-center mt-8 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center relative">
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
