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
