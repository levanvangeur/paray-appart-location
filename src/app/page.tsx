import { getApartments, getSettings } from '@/lib/data'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSlideshow from '@/components/HeroSlideshow'
import ApartmentSection from '@/components/ApartmentSection'
import ContactForm from '@/components/ContactForm'

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
              {settings.city} · {settings.region}
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
            <a href="#contact" className="btn-outline-gold">Nous contacter</a>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-20 max-w-md mx-auto">
            {[
              { value: '6', label: 'Appartements' },
              { value: '5★', label: 'Expérience' },
              { value: '100%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl text-gold font-semibold">{s.value}</div>
                <div className="text-xs tracking-widest uppercase text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gold/40 z-10">
          <span className="text-xs tracking-widest uppercase">Défiler</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section id="a-propos" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-gold" />
          <span className="text-xs tracking-[0.3em] uppercase text-gold">Notre histoire</span>
          <div className="w-12 h-px bg-gold" />
        </div>
        <h2 className="section-title mb-4">{settings.aboutTitle}</h2>
        <div className="gold-divider" />
        <p className="text-gray-400 leading-relaxed text-lg max-w-2xl mx-auto">{settings.aboutText}</p>
      </section>

      {/* ── APPARTEMENTS ── */}
      <section id="appartements">
        <div className="text-center py-16 px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold">Nos logements</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h2 className="section-title">Nos 6 Appartements</h2>
          <div className="gold-divider" />
          <p className="text-gray-400 max-w-xl mx-auto">
            Chaque appartement est unique et soigneusement aménagé pour vous offrir le meilleur du confort.
          </p>
        </div>

        {apartments.map((apt, i) => (
          <ApartmentSection key={apt.id} apartment={apt} reversed={i % 2 === 1} />
        ))}
      </section>

      {/* ── AVANTAGES ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold">Pourquoi nous choisir</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h2 className="section-title">L&apos;Excellence à Chaque Séjour</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '◈', title: 'Qualité Premium', desc: 'Des appartements entièrement équipés avec des matériaux et meubles de qualité.' },
            { icon: '◉', title: 'Emplacement idéal', desc: 'Situés au cœur de Paray le Monial, proches de tous les sites incontournables.' },
            { icon: '◇', title: 'Service personnalisé', desc: 'Nous sommes disponibles pour répondre à toutes vos questions.' },
            { icon: '◆', title: 'Flexibilité', desc: 'Des tarifs adaptés à tous les séjours : week-end, semaine ou plus long terme.' },
          ].map((f) => (
            <div key={f.title} className="text-center p-8 card-luxury">
              <div className="text-gold text-4xl mb-6">{f.icon}</div>
              <h3 className="font-serif text-lg text-white mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-6 bg-noir-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold">Réservation</span>
              <div className="w-12 h-px bg-gold" />
            </div>
            <h2 className="section-title">Contactez-nous</h2>
            <div className="gold-divider" />
            <p className="text-gray-400 max-w-xl mx-auto">
              Envoyez-nous votre demande et nous vous répondrons rapidement pour confirmer les disponibilités.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div>
                <div className="text-gold text-2xl mb-3">✉</div>
                <h4 className="text-xs tracking-widest uppercase text-gold mb-1">Email</h4>
                <a href={`mailto:${settings.contactEmail}`} className="text-gray-300 hover:text-gold transition-colors text-sm">
                  {settings.contactEmail}
                </a>
              </div>
              <div>
                <div className="text-gold text-2xl mb-3">☎</div>
                <h4 className="text-xs tracking-widest uppercase text-gold mb-1">Téléphone</h4>
                <a href={`tel:${settings.contactPhone}`} className="text-gray-300 hover:text-gold transition-colors text-sm">
                  {settings.contactPhone}
                </a>
              </div>
              <div>
                <div className="text-gold text-2xl mb-3">⚑</div>
                <h4 className="text-xs tracking-widest uppercase text-gold mb-1">Localisation</h4>
                <p className="text-gray-300 text-sm">{settings.contactAddress}</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <ContactForm apartments={apartments.map((a) => ({ id: a.id, name: a.name }))} />
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </>
  )
}
