import { NextRequest, NextResponse } from 'next/server'
import { getBlockedDates, addReservation, nextInvoiceNumber, getApartmentById } from '@/lib/data'
import type { Reservation } from '@/lib/types'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const apartmentId = searchParams.get('apartmentId')
  if (!apartmentId) return NextResponse.json({ error: 'apartmentId requis' }, { status: 400 })
  const blocked = getBlockedDates(apartmentId)
  return NextResponse.json({ blocked })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apartmentId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, message } = body

    if (!apartmentId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })
    }

    const apt = getApartmentById(apartmentId)
    if (!apt) return NextResponse.json({ error: 'Appartement introuvable.' }, { status: 404 })

    const blocked = getBlockedDates(apartmentId)
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    if (end <= start) return NextResponse.json({ error: 'Dates invalides.' }, { status: 400 })

    const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0]
      if (blocked.includes(ds)) {
        return NextResponse.json({ error: `La date ${ds} n'est pas disponible.` }, { status: 409 })
      }
    }

    const invoiceNumber = nextInvoiceNumber()
    const reservation: Reservation = {
      id: randomUUID(),
      apartmentId,
      apartmentName: apt.name,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkIn,
      checkOut,
      nights,
      guests: guests || 1,
      totalPrice: nights * apt.pricePerNight,
      status: 'pending',
      paymentMethod: 'pending',
      invoiceNumber,
      source: 'direct',
      message: message || '',
      createdAt: new Date().toISOString(),
    }

    addReservation(reservation)
    return NextResponse.json(reservation, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
