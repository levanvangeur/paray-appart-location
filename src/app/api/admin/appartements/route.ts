import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { getApartments, saveApartments, updateApartment } from '@/lib/data'
import type { Apartment } from '@/lib/types'

export async function GET() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  return NextResponse.json(getApartments())
}

export async function PUT(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 })

  const updated = updateApartment(id, data)
  if (!updated) return NextResponse.json({ error: 'Appartement introuvable.' }, { status: 404 })

  return NextResponse.json(updated)
}

export async function POST(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const apartments = getApartments()
  const newApartment: Apartment = await req.json()
  apartments.push(newApartment)
  saveApartments(apartments)

  return NextResponse.json(newApartment, { status: 201 })
}
