import { redirect, notFound } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/auth'
import { getApartmentById } from '@/lib/data'
import Link from 'next/link'
import AdminNav from '../../AdminNav'
import ApartmentEditor from './ApartmentEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditApartmentPage({ params }: Props) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) redirect('/admin/login')

  const { id } = await params
  const apartment = getApartmentById(id)
  if (!apartment) notFound()

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <Link href="/admin/appartements" className="text-gray-500 text-xs tracking-widest uppercase hover:text-gold transition-colors">
            ← Retour aux appartements
          </Link>
          <h1 className="font-serif text-3xl text-white mt-3 mb-1">Modifier : {apartment.name}</h1>
        </div>
        <ApartmentEditor apartment={apartment} />
      </main>
    </div>
  )
}
