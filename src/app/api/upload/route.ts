import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const isAuth = await getSessionFromCookies()
  if (!isAuth) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'appartement'
  const apartmentId = formData.get('apartmentId') as string

  if (!file) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo).' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'

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
}
