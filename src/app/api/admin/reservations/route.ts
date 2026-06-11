import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { getReservations, updateReservation, addReservation } from '@/lib/data'
import type { Reservation } from '@/lib/types'
import { randomUUID } from 'crypto'

export async function GET() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  return NextResponse.json(getReservations())
}

export async function PUT(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 })
  const updated = updateReservation(id, data)
  if (!updated) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })
  return NextResponse.json(updated)
}

// Ajouter manuellement une réservation bloquée (ex: ménage, travaux)
export async function POST(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const body: Partial<Reservation> = await req.json()
  const reservation: Reservation = {
    id: randomUUID(),
    apartmentId: body.apartmentId!,
    apartmentName: body.apartmentName || '',
    guestName: body.guestName || 'Bloqué',
    guestEmail: body.guestEmail || '',
    guestPhone: body.guestPhone || '',
    checkIn: body.checkIn!,
    checkOut: body.checkOut!,
    nights: body.nights || 1,
    guests: body.guests || 0,
    totalPrice: body.totalPrice || 0,
    status: body.status || 'confirmed',
    paymentMethod: body.paymentMethod || 'pending',
    source: body.source || 'blocked',
    message: body.message || '',
    createdAt: new Date().toISOString(),
  }
  addReservation(reservation)
  return NextResponse.json(reservation, { status: 201 })
}
