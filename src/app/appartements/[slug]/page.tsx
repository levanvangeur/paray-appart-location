import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getApartments, getApartmentBySlug, getSettings } from '@/lib/data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const apartments = getApartments()
  return apartments.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const apartment = getApartmentBySlug(slug)
  if (!apartment) return {}
  return {
    title: `${apartment.name} — Nos Appartements à Paray le Monial`,
    description: apartment.shortDescription,
  }
}

export default async function ApartmentPage({ params }: Props) {
  const { slug } = await params
  const apartment = getApartmentBySlug(slug)
  if (!apartment) notFound()

  const settings = getSettings()
  const apartments = getApartments()

  const placeholderImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&h=800&fit=crop&q=80',
  ]

  const images = apartment.images.length > 0
    ? apartment.images.map((img) => `/images/appartements/${img}`)
    : placeholderImages

  return (
    <>
      <Header />

      {/* HERO IMAGE */}
      <section className="relative h-[70vh] mt-0">
        <div className="absolute inset-0">
          <Image
            src={images[0]}
            alt={apartment.name}
            fill
            className="object-cover"
            unoptimized={!apartment.images.length}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-transparent to-noir" />
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-24 left-0 right-0 px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-gray-400">
              <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
              <span className="text-gold">›</span>
              <Link href="/#appartements" className="hover:text-gold transition-colors">Appartements</Link>
              <span className="text-gold">›</span>
              <span className="text-white">{apartment.name}</span>
            </nav>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold">Appartement</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold text-white">{apartment.name}</h1>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Image gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative h-48 overflow-hidden">
                    <Image
                      src={img}
                      alt={`${apartment.name} - photo ${i + 2}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      unoptimized={!apartment.images.length}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl text-white mb-4">À propos de cet appartement</h2>
              <div className="w-10 h-px bg-gold mb-6" />
              <p className="text-gray-300 leading-relaxed text-base">{apartment.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-serif text-2xl text-white mb-4">Équipements</h2>
              <div className="w-10 h-px bg-gold mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {apartment.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-3 bg-noir-card border border-noir-border">
                    <span className="text-gold text-sm">✓</span>
                    <span className="text-gray-300 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div id="reserver">
              <h2 className="font-serif text-2xl text-white mb-4">Demande de réservation</h2>
              <div className="w-10 h-px bg-gold mb-6" />
              <ContactForm
                apartments={apartments.map((a) => ({ id: a.id, name: a.name }))}
                preselectedId={apartment.id}
              />
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">

            {/* Price card */}
            <div className="card-luxury p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-gold/60 text-xs tracking-widest uppercase mb-1">À partir de</div>
                <div className="font-serif text-5xl text-gold font-semibold">{apartment.pricePerNight}€</div>
                <div className="text-gray-400 text-sm">par nuit</div>
              </div>

              <div className="space-y-3 mb-6 border-t border-noir-border pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Surface</span>
                  <span className="text-white font-medium">{apartment.surface} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Capacité</span>
                  <span className="text-white font-medium">{apartment.capacity} personnes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Chambres</span>
                  <span className="text-white font-medium">{apartment.bedrooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Salles de bain</span>
                  <span className="text-white font-medium">{apartment.bathrooms}</span>
                </div>
              </div>

              <a href="#reserver" className="btn-gold w-full text-center block">
                Réserver cet appartement
              </a>

              <div className="mt-4 text-center">
                <a href={`tel:${settings.contactPhone}`} className="text-gray-400 text-sm hover:text-gold transition-colors">
                  Ou appelez-nous : {settings.contactPhone}
                </a>
              </div>
            </div>

            {/* Availability badge */}
            <div className="card-luxury p-4 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${apartment.available ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">
                {apartment.available ? 'Disponible à la réservation' : 'Actuellement indisponible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer settings={settings} />
    </>
  )
}
