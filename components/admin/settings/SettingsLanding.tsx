import Link from 'next/link'
import { CreditCard, Building2, ChevronRight } from 'lucide-react'

const sections = [
  {
    href: '/admin/settings/payment',
    icon: <CreditCard size={20} className="text-sage-deep" />,
    title: 'Payment Gateways',
    description: 'Configure Razorpay, PhonePe, Cashfree, CCAvenue, and PayU credentials. Choose which gateway is active.',
  },
  {
    href: '/admin/settings/site',
    icon: <Building2 size={20} className="text-sage-deep" />,
    title: 'Site Settings',
    description: 'Resort contact info, social links, default SEO, and global website settings.',
  },
]

export function SettingsLanding() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px]">
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="block bg-card rounded-2xl p-5 hover:shadow-[0_2px_12px_rgba(45,55,30,0.08)] border border-border hover:border-accent-deep/40 transition-all no-underline group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-foreground">{s.title}</h3>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
