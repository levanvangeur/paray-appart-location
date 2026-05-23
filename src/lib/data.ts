import fs from 'fs'
import path from 'path'
import type { Apartment, SiteSettings } from './types'

const dataDir = path.join(process.cwd(), 'src', 'data')

function readJSON<T>(filename: string): T {
  const filePath = path.join(dataDir, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function getApartments(): Apartment[] {
  return readJSON<Apartment[]>('apartments.json')
}

export function getApartmentBySlug(slug: string): Apartment | undefined {
  return getApartments().find((a) => a.slug === slug)
}

export function getApartmentById(id: string): Apartment | undefined {
  return getApartments().find((a) => a.id === id)
}

export function saveApartments(apartments: Apartment[]): void {
  writeJSON('apartments.json', apartments)
}

export function updateApartment(id: string, data: Partial<Apartment>): Apartment | null {
  const apartments = getApartments()
  const index = apartments.findIndex((a) => a.id === id)
  if (index === -1) return null
  apartments[index] = { ...apartments[index], ...data }
  saveApartments(apartments)
  return apartments[index]
}

export function getSettings(): SiteSettings {
  return readJSON<SiteSettings>('settings.json')
}

export function saveSettings(settings: SiteSettings): void {
  writeJSON('settings.json', settings)
}
