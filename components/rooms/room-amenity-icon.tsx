import {
  Armchair,
  Bath,
  BedDouble,
  BellRing,
  BriefcaseBusiness,
  CarFront,
  Coffee,
  ConciergeBell,
  Droplets,
  Leaf,
  type LucideIcon,
  Shirt,
  Sparkles,
  Trees,
  Tv,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wind,
} from 'lucide-react'

const resortAmenityRegistry: Record<string, LucideIcon> = {
  CarFront,
  Coffee,
  Sparkles,
  UtensilsCrossed,
  Wifi,
}

const roomAmenityRegistry: Record<string, LucideIcon> = {
  '24x7 Front Desk': BellRing,
  'Air Conditioning': Wind,
  Balcony: Trees,
  'Complimentary Breakfast': Coffee,
  'Cupboard Space': Shirt,
  'Dressing Area': Shirt,
  'Extra Bed Option': BedDouble,
  'Garden Access': Trees,
  'Garden Balcony': Trees,
  'Garden View': Trees,
  'Hot Water': Droplets,
  'Laundry Service': Sparkles,
  'Living Area': Armchair,
  'Mini Fridge': Coffee,
  'Pool Access': Waves,
  'Premium Bath': Bath,
  'Room Service': ConciergeBell,
  'Smart TV': Tv,
  'Tea Counter': Coffee,
  TV: Tv,
  Wardrobe: Shirt,
  'Wi-Fi': Wifi,
  'Work Desk': BriefcaseBusiness,
}

export function ResortAmenityIcon({
  icon,
  className,
}: {
  icon: string
  className?: string
}) {
  const Icon = resortAmenityRegistry[icon] ?? Leaf

  return <Icon className={className} />
}

export function RoomAmenityIcon({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const Icon = roomAmenityRegistry[label] ?? Leaf

  return <Icon className={className} />
}
