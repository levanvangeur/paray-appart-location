export interface Apartment {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  surface: number
  capacity: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  images: string[]
  amenities: string[]
  available: boolean
  featured: boolean
  icalUrls?: {
    airbnb?: string
    booking?: string
    extra?: string
  }
}

export interface Reservation {
  id: string
  apartmentId: string
  apartmentName: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  paymentMethod: 'stripe' | 'paypal' | 'pending'
  paymentId?: string
  invoiceNumber?: string
  source: 'direct' | 'airbnb' | 'booking' | 'blocked'
  message?: string
  createdAt: string
}

export interface SiteSettings {
  siteName: string
  siteTagline: string
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutText: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string
  instagramUrl: string
  city: string
  region: string
  metaDescription: string
  heroImages: string[]
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  apartmentId: string
  checkIn: string
  checkOut: string
  guests: number
  message: string
}
