'use client'

import { useState } from 'react'
import type { Reservation, Apartment } from '@/lib/types'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
}
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-green-400 border-green-400/30 bg-green-400/10',
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
}
const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  blocked: 'Bloqué',
}

interface Props {
  reservations: Reservation[]
  apartments: Apartment[]
}

export default function AdminReservationsClient({ reservations: initial, apartments }: Props) {
  const [reservations, setReservations] = useState(initial)
  const [filter, setFilter] = useState({ apt: '', status: '' })
  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncMsg, setSyncMsg] = useState('')

  const filtered = reservations.filter((r) => {
    if (filter.apt && r.apartmentId !== filter.apt) return false
    if (filter.status && r.status !== filter.status) return false
    return true
  })

  const totalConfirmed = reservations
    .filter((r) => r.status === 'confirmed' && r.source === 'direct')
    .reduce((s, r) => s + r.totalPrice, 0)

  const syncIcal = async (apartmentId: string) => {
    setSyncing(apartmentId)
    setSyncMsg('')
    const res = await fetch('/api/ical/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apartmentId }),
    })
    const data = await res.json()
    setSyncMsg(data.message || '')
    setSyncing(null)
    // Refresh
    const fresh = await fetch('/api/admin/reservations')
    if (fresh.ok) setReservations(await fresh.json())
  }

  const updateStatus = async (id: string, status: Reservation['status']) => {
    const res = await fetch('/api/admin/reservations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    }
  }

  return (
    <div className="min-h-screen bg-noir text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="text-gold/60 text-xs hover:text-gold mb-2 block">← Dashboard</Link>
            <h1 className="font-serif text-3xl text-white">Réservations</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Revenus confirmés</div>
            <div className="font-serif text-2xl text-gold">{totalConfirmed.toFixed(2)} €</div>
          </div>
        </div>

        {/* Sync iCal */}
        <section className="bg-noir-card border border-noir-border p-5 mb-6">
          <h2 className="text-sm font-medium text-gold mb-3 tracking-widest uppercase">Synchroniser les calendriers Airbnb / Booking.com</h2>
          <div className="flex flex-wrap gap-3">
            {apartments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => syncIcal(apt.id)}
                disabled={syncing === apt.id}
                className="text-xs border border-noir-border px-3 py-2 hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
              >
                {syncing === apt.id ? '⟳ Sync...' : `↺ ${apt.name}`}
              </button>
            ))}
            <button
              onClick={async () => {
                setSyncing('all')
                const res = await fetch('/api/ical/sync')
                const data = await res.json()
                setSyncMsg(JSON.stringify(data.results, null, 0).replace(/[{}"]/g, ''))
                setSyncing(null)
                const fresh = await fetch('/api/admin/reservations')
                if (fresh.ok) setReservations(await fresh.json())
              }}
              disabled={!!syncing}
              className="text-xs border border-gold/40 text-gold px-3 py-2 hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              ↺ Tout synchroniser
            </button>
          </div>
          {syncMsg && <p className="text-green-400 text-xs mt-2">{syncMsg}</p>}
          <p className="text-gray-500 text-xs mt-2">
            Configurez les URLs iCal dans les paramètres de chaque appartement.
          </p>
        </section>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <select
            value={filter.apt}
            onChange={(e) => setFilter((f) => ({ ...f, apt: e.target.value }))}
            className="bg-noir border border-noir-border text-white text-sm px-3 py-2"
          >
            <option value="">Tous les appartements</option>
            {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="bg-noir border border-noir-border text-white text-sm px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            <option value="confirmed">Confirmées</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulées</option>
          </select>
          <span className="text-gray-400 text-sm self-center">{filtered.length} réservation{filtered.length > 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="bg-noir-card border border-noir-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-noir-border">
                {['Appartement', 'Voyageur', 'Arrivée', 'Départ', 'Nuits', 'Total', 'Source', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs tracking-widest uppercase text-gold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-gray-500 py-10">Aucune réservation</td></tr>
              )}
              {filtered
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((r) => (
                <tr key={r.id} className="border-b border-noir-border/50 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">{r.apartmentName}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{r.guestName}</div>
                    {r.guestEmail && <div className="text-gray-500 text-xs">{r.guestEmail}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{new Date(r.checkIn).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-gray-300">{new Date(r.checkOut).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-gray-300">{r.nights}</td>
                  <td className="px-4 py-3 text-gold">{r.totalPrice > 0 ? `${r.totalPrice.toFixed(2)} €` : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{SOURCE_LABELS[r.source] || r.source}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLORS[r.status] || ''}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <button onClick={() => updateStatus(r.id, 'confirmed')} className="text-xs text-green-400 hover:underline">Confirmer</button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => updateStatus(r.id, 'cancelled')} className="text-xs text-red-400 hover:underline">Annuler</button>
                      )}
                      {r.status === 'confirmed' && r.source === 'direct' && (
                        <a href={`/api/invoice/${r.id}`} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">Facture</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
