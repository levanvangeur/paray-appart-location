import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Test de connectivité
export async function GET() {
  return NextResponse.json({ status: 'upload-api-ok' })
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await getSessionFromCookies()
    if (!isAuth) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    }

    const { filename: origName, type, apartmentId, data: base64Data, mimeType } = await req.json()

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!origName || !base64Data || !mimeType) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })
    }
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Type non supporté. Utilisez JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo).' }, { status: 400 })
    }

    const ext = origName.split('.').pop()?.toLowerCase() || 'jpg'
    let uploadDir: string
    let filename: string

    if (type === 'hero') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'hero')
      filename = `hero-${Date.now()}.${ext}`
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'appartements')
      filename = `apt-${apartmentId || 'x'}-${Date.now()}.${ext}`
    }

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ filename })
  } catch (err) {
    console.error('Erreur upload:', err)
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: `Erreur serveur : ${message}` }, { status: 500 })
  }
}
