import Link from 'next/link'
import Image from 'next/image'
import type { Apartment } from '@/lib/types'

interface ApartmentCardProps {
  apartment: Apartment
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const placeholderImage = `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80`

  return (
    <Link href={`/appartements/${apartment.slug}`} className="group block">
      <div className="card-luxury overflow-hidden">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-noir-card">
          {apartment.images.length > 0 ? (
            <Image
              src={`/images/appartements/${apartment.images[0]}`}
              alt={apartment.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <Image
              src={placeholderImage}
              alt={apartment.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
              unoptimized
            />
          )}
          {/* Gold overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent opacity-60" />

          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-gold text-noir text-xs font-bold tracking-widest uppercase px-3 py-1.5">
            {apartment.pricePerNight}€ / nuit
          </div>

          {apartment.featured && (
            <div className="absolute top-4 left-4 border border-gold text-gold text-xs tracking-widest uppercase px-3 py-1.5">
              Coup de cœur
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-px bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase">Appartement</span>
          </div>

          <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors">
            {apartment.name}
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2">
            {apartment.shortDescription}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-gray-500 text-xs tracking-wide border-t border-noir-border pt-4">
            <span className="flex items-center gap-1.5">
              <span className="text-gold">⊞</span> {apartment.surface} m²
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gold">☾</span> {apartment.bedrooms} ch.
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gold">♟</span> {apartment.capacity} pers.
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
