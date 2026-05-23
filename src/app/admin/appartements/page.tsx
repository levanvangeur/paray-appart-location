import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/auth'
import { getApartments } from '@/lib/data'
import Link from 'next/link'
import AdminNav from '../AdminNav'

export default async function AdminApartmentsPage() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) redirect('/admin/login')

  const apartments = getApartments()

  return (
    <div className="flex">
      <AdminNav />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Appartements</h1>
            <p className="text-gray-400 text-sm">{apartments.length} appartements configurés</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {apartments.map((apt) => (
            <div key={apt.id} className="bg-noir-card border border-noir-border overflow-hidden">
              {/* Image placeholder */}
              <div className="h-40 bg-noir flex items-center justify-center border-b border-noir-border relative">
                {apt.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/images/appartements/${apt.images[0]}`}
                    alt={apt.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-gold/30 text-5xl mb-2">⊞</div>
                    <div className="text-gray-600 text-xs">Pas de photo</div>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium ${
                  apt.available ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
                }`}>
                  {apt.available ? 'Disponible' : 'Indisponible'}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-lg text-white mb-1">{apt.name}</h3>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{apt.shortDescription}</p>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-5">
                  <span>{apt.surface}m²</span>
                  <span>{apt.bedrooms} ch.</span>
                  <span className="text-gold font-medium">{apt.pricePerNight}€/nuit</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/appartements/${apt.id}`}
                    className="flex-1 btn-gold text-xs py-2 text-center"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={`/appartements/${apt.slug}`}
                    target="_blank"
                    className="px-3 py-2 border border-noir-border text-gray-400 hover:text-gold hover:border-gold transition-colors text-xs"
                  >
                    ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
