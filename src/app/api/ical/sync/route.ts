import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { getApartments, getReservations, saveReservations } from '@/lib/data'
import type { Reservation } from '@/lib/types'
import { randomUUID } from 'crypto'

// Minimal iCal parser — extracts VEVENT blocks
function parseIcal(text: string): Array<{ summary: string; dtstart: string; dtend: string; uid: string }> {
  const events: Array<{ summary: string; dtstart: string; uid: string; dtend: string }> = []
  const blocks = text.split('BEGIN:VEVENT')
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:([^\r\n]+)`))
      return m ? m[1].trim() : ''
    }
    const dtstart = get('DTSTART')
    const dtend = get('DTEND')
    const summary = get('SUMMARY')
    const uid = get('UID')
    if (dtstart && dtend) {
      events.push({ summary, dtstart, dtend, uid })
    }
  }
  return events
}

function icalDateToISO(d: string): string {
  // formats: 20240601 or 20240601T120000Z
  const s = d.replace(/[TZ]/g, '').slice(0, 8)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

export async function POST(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { apartmentId } = await req.json()
  const apartments = getApartments()
  const apt = apartments.find((a) => a.id === apartmentId)
  if (!apt) return NextResponse.json({ error: 'Appartement introuvable.' }, { status: 404 })

  const urls: string[] = []
  if (apt.icalUrls?.airbnb) urls.push(apt.icalUrls.airbnb)
  if (apt.icalUrls?.booking) urls.push(apt.icalUrls.booking)
  if (apt.icalUrls?.extra) urls.push(apt.icalUrls.extra)

  if (urls.length === 0) {
    return NextResponse.json({ message: 'Aucune URL iCal configurée.', imported: 0 })
  }

  let reservations = getReservations()
  // Remove old iCal-imported entries for this apartment
  reservations = reservations.filter(
    (r) => r.apartmentId !== apartmentId || (r.source !== 'airbnb' && r.source !== 'booking')
  )

  let imported = 0
  for (const url of urls) {
    const source = url.includes('airbnb') ? 'airbnb' : 'booking'
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue
      const text = await res.text()
      const events = parseIcal(text)
      for (const ev of events) {
        const checkIn = icalDateToISO(ev.dtstart)
        const checkOut = icalDateToISO(ev.dtend)
        const start = new Date(checkIn)
        const end = new Date(checkOut)
        const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
        const r: Reservation = {
          id: randomUUID(),
          apartmentId,
          apartmentName: apt.name,
          guestName: ev.summary || 'Réservation externe',
          guestEmail: '',
          guestPhone: '',
          checkIn,
          checkOut,
          nights,
          guests: 0,
          totalPrice: 0,
          status: 'confirmed',
          paymentMethod: 'pending',
          source,
          createdAt: new Date().toISOString(),
        }
        reservations.push(r)
        imported++
      }
    } catch {
      // Skip failed URL
    }
  }

  saveReservations(reservations)
  return NextResponse.json({ message: `${imported} réservations importées.`, imported })
}

// GET: sync all apartments
export async function GET() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const apartments = getApartments()
  const results: Record<string, number> = {}

  for (const apt of apartments) {
    const urls: string[] = []
    if (apt.icalUrls?.airbnb) urls.push(apt.icalUrls.airbnb)
    if (apt.icalUrls?.booking) urls.push(apt.icalUrls.booking)
    if (apt.icalUrls?.extra) urls.push(apt.icalUrls.extra)
    if (urls.length === 0) continue

    let reservations = getReservations()
    reservations = reservations.filter(
      (r) => r.apartmentId !== apt.id || (r.source !== 'airbnb' && r.source !== 'booking')
    )

    let imported = 0
    for (const url of urls) {
      const source = url.includes('airbnb') ? 'airbnb' : 'booking'
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) continue
        const text = await res.text()
        const events = parseIcal(text)
        for (const ev of events) {
          const checkIn = icalDateToISO(ev.dtstart)
          const checkOut = icalDateToISO(ev.dtend)
          const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
          reservations.push({
            id: randomUUID(),
            apartmentId: apt.id,
            apartmentName: apt.name,
            guestName: ev.summary || 'Réservation externe',
            guestEmail: '', guestPhone: '',
            checkIn, checkOut, nights, guests: 0, totalPrice: 0,
            status: 'confirmed', paymentMethod: 'pending', source,
            createdAt: new Date().toISOString(),
          })
          imported++
        }
      } catch { /* skip */ }
    }
    saveReservations(reservations)
    results[apt.name] = imported
  }

  return NextResponse.json({ results })
}
