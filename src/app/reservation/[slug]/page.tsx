import { getApartmentBySlug, getApartments } from '@/lib/data'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSettings } from '@/lib/data'
import BookingPageClient from './BookingPageClient'

export async function generateStaticParams() {
  return getApartments().map((a) => ({ slug: a.slug }))
}

export default async function ReservationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const apartment = getApartmentBySlug(slug)
  if (!apartment) notFound()
  const settings = getSettings()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-px bg-gold" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold">Réservation</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">{apartment.name}</h1>
          <p className="text-gray-400 text-sm mb-10">{apartment.shortDescription}</p>
          <BookingPageClient apartment={apartment} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  )
}
