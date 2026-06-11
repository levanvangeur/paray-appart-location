export const dynamic = 'force-dynamic'

import { getApartments, getSettings } from '@/lib/data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSlideshow from '@/components/HeroSlideshow'
import ApartmentSection from '@/components/ApartmentSection'

export default function HomePage() {
  const apartments = getApartments()
  const settings = getSettings()

  const heroImages = (settings.heroImages ?? []).map((f) => `/images/hero/${f}`)

  return (
    <>
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroSlideshow images={heroImages} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-px bg-gold" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              {settings.city}
            </span>
            <div className="w-16 h-px bg-gold" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight">
            {settings.heroTitle}
          </h1>

          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#appartements" className="btn-gold">Découvrir nos appartements</a>
          </div>

        </div>

      </section>

      {/* ── APPARTEMENTS ── */}
      <section id="appartements">
        <div className="text-center py-16 px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold">Nos logements</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h2 className="section-title">Nos Appartements</h2>
          <div className="gold-divider" />
          <p className="text-gray-400 max-w-xl mx-auto">
            Chaque appartement est unique et soigneusement aménagé pour vous offrir le meilleur du confort.
          </p>
        </div>

        {apartments.map((apt, i) => (
          <ApartmentSection key={apt.id} apartment={apt} index={i} />
        ))}
      </section>

      <Footer settings={settings} />
    </>
  )
}
