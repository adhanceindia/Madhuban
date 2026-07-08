import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Registration flow is now handled in the main login component UI
  redirect('/login')
}
