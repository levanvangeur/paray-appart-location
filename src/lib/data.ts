import fs from 'fs'
import path from 'path'
import type { Apartment, SiteSettings, Reservation } from './types'

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

export function getReservations(): Reservation[] {
  return readJSON<Reservation[]>('reservations.json')
}

export function saveReservations(reservations: Reservation[]): void {
  writeJSON('reservations.json', reservations)
}

export function getReservationById(id: string): Reservation | undefined {
  return getReservations().find((r) => r.id === id)
}

export function addReservation(reservation: Reservation): Reservation {
  const reservations = getReservations()
  reservations.push(reservation)
  saveReservations(reservations)
  return reservation
}

export function updateReservation(id: string, data: Partial<Reservation>): Reservation | null {
  const reservations = getReservations()
  const index = reservations.findIndex((r) => r.id === id)
  if (index === -1) return null
  reservations[index] = { ...reservations[index], ...data }
  saveReservations(reservations)
  return reservations[index]
}

export function getBlockedDates(apartmentId: string): string[] {
  const reservations = getReservations()
  const blocked: string[] = []
  for (const r of reservations) {
    if (r.apartmentId !== apartmentId) continue
    if (r.status === 'cancelled') continue
    const start = new Date(r.checkIn)
    const end = new Date(r.checkOut)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      blocked.push(d.toISOString().split('T')[0])
    }
  }
  return [...new Set(blocked)]
}

let invoiceCounter: number | null = null
export function nextInvoiceNumber(): string {
  if (invoiceCounter === null) {
    const reservations = getReservations()
    const nums = reservations
      .map((r) => r.invoiceNumber)
      .filter(Boolean)
      .map((n) => parseInt(n!.split('-')[2] || '0', 10))
    invoiceCounter = nums.length > 0 ? Math.max(...nums) : 0
  }
  invoiceCounter!++
  const year = new Date().getFullYear()
  return `FAC-${year}-${String(invoiceCounter).padStart(4, '0')}`
}
