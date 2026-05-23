import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/auth'
import { getSettings } from '@/lib/data'
import AdminNav from '../AdminNav'
import SettingsEditor from './SettingsEditor'

export default async function ParametresPage() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) redirect('/admin/login')

  const settings = getSettings()

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-white mb-1">Paramètres du site</h1>
          <p className="text-gray-400 text-sm">Modifiez les textes, coordonnées et informations affichés sur le site.</p>
        </div>
        <SettingsEditor settings={settings} />
      </main>
    </div>
  )
}
