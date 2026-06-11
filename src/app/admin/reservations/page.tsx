import { getSessionFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getReservations, getApartments } from '@/lib/data'
import AdminReservationsClient from './AdminReservationsClient'

export default async function AdminReservationsPage() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) redirect('/admin/login')

  const reservations = getReservations()
  const apartments = getApartments()

  return <AdminReservationsClient reservations={reservations} apartments={apartments} />
}
