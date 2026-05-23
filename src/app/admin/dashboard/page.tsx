import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/auth'
import { getApartments, getSettings } from '@/lib/data'
import Link from 'next/link'
import AdminNav from '../AdminNav'

export default async function DashboardPage() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) redirect('/admin/login')

  const apartments = getApartments()
  const settings = getSettings()
  const available = apartments.filter((a) => a.available).length

  return (
    <div className="flex">
      <AdminNav />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-white mb-1">Tableau de bord</h1>
          <p className="text-gray-400 text-sm">Bienvenue dans votre espace de gestion.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Appartements total', value: apartments.length, icon: '⊞', color: 'text-gold' },
            { label: 'Disponibles', value: available, icon: '✓', color: 'text-green-400' },
            { label: 'Indisponibles', value: apartments.length - available, icon: '✗', color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-noir-card border border-noir-border p-6">
              <div className={`text-3xl mb-2 ${stat.color}`}>{stat.icon}</div>
              <div className="font-serif text-3xl text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-noir-card border border-noir-border p-6">
            <h2 className="font-serif text-lg text-white mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link href="/admin/appartements" className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm">
                <span className="text-gold">→</span> Gérer les appartements
              </Link>
              <Link href="/admin/parametres" className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm">
                <span className="text-gold">→</span> Modifier les textes du site
              </Link>
              <Link href="/" target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm">
                <span className="text-gold">→</span> Voir le site en ligne ↗
              </Link>
            </div>
          </div>

          <div className="bg-noir-card border border-noir-border p-6">
            <h2 className="font-serif text-lg text-white mb-4">Informations du site</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nom du site</span>
                <span className="text-white">{settings.siteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email de contact</span>
                <span className="text-white text-xs">{settings.contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Téléphone</span>
                <span className="text-white">{settings.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Apartments list preview */}
        <div className="bg-noir-card border border-noir-border">
          <div className="flex items-center justify-between p-6 border-b border-noir-border">
            <h2 className="font-serif text-lg text-white">Vos appartements</h2>
            <Link href="/admin/appartements" className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors">
              Tout gérer →
            </Link>
          </div>
          <div className="divide-y divide-noir-border">
            {apartments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-noir transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${apt.available ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <div className="text-white text-sm font-medium">{apt.name}</div>
                    <div className="text-gray-500 text-xs">{apt.surface}m² · {apt.bedrooms} ch. · {apt.capacity} pers.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gold font-medium text-sm">{apt.pricePerNight}€/nuit</span>
                  <Link
                    href={`/admin/appartements/${apt.id}`}
                    className="text-xs text-gray-400 hover:text-gold transition-colors border border-noir-border px-3 py-1.5"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
