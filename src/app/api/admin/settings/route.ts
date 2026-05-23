import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { getSettings, saveSettings } from '@/lib/data'

export async function GET() {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  return NextResponse.json(getSettings())
}

export async function PUT(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const settings = await req.json()
  saveSettings(settings)
  return NextResponse.json(settings)
}
