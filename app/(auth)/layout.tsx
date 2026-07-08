import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf9f4] flex flex-col items-center justify-center p-4">
      {children}
    </div>
  )
}
