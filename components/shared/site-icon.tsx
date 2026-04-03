import {
  AirVent,
  ArrowRight,
  Bath,
  BatteryCharging,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Coffee,
  ConciergeBell,
  ExternalLink,
  Images,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  PartyPopper,
  Phone,
  Sparkles,
  Trees,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

const iconRegistry: Record<string, LucideIcon> = {
  AirVent,
  ArrowRight,
  Bath,
  BatteryCharging,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Coffee,
  ConciergeBell,
  ExternalLink,
  Images,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  PartyPopper,
  Phone,
  Sparkles,
  Trees,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
}

export function SiteIcon({
  icon,
  className,
}: {
  icon: string
  className?: string
}) {
  const Icon = iconRegistry[icon] ?? Sparkles

  return <Icon className={className} />
}
