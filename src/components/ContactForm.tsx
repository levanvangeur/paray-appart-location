'use client'

import { useState } from 'react'
import type { Apartment } from '@/lib/types'

interface ContactFormProps {
  apartments: Pick<Apartment, 'id' | 'name'>[]
  preselectedId?: string
}

export default function ContactForm({ apartments, preselectedId }: ContactFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    apartmentId: preselectedId || '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', apartmentId: preselectedId || '', checkIn: '', checkOut: '', guests: 2, message: '' })
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Une erreur est survenue.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Impossible d\'envoyer le message. Vérifiez votre connexion.')
      setStatus('error')
    }
  }

  const inputClass = "w-full bg-noir border border-noir-border text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <div className="text-gold text-5xl mb-6">✓</div>
        <h3 className="font-serif text-2xl text-white mb-3">Message envoyé !</h3>
        <p className="text-gray-400">Nous vous répondrons dans les plus brefs délais.</p>
        <button onClick={() => setStatus('idle')} className="btn-outline-gold mt-8 text-xs">
          Envoyer une autre demande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Nom complet *</label>
          <input
            type="text" name="name" value={form.name} onChange={handleChange}
            placeholder="Jean Dupont" required className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Email *</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="jean@exemple.fr" required className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Téléphone</label>
          <input
            type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="06 00 00 00 00" className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Appartement souhaité</label>
          <select name="apartmentId" value={form.apartmentId} onChange={handleChange} className={inputClass}>
            <option value="">Tous / Je ne sais pas encore</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Arrivée</label>
          <input
            type="date" name="checkIn" value={form.checkIn} onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Départ</label>
          <input
            type="date" name="checkOut" value={form.checkOut} onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-gold mb-2">Voyageurs</label>
          <input
            type="number" name="guests" value={form.guests} onChange={handleChange}
            min={1} max={10} className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-gold mb-2">Message</label>
        <textarea
          name="message" value={form.message} onChange={handleChange}
          placeholder="Vos questions, demandes particulières..." rows={4}
          className={inputClass + ' resize-none'}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit" disabled={status === 'loading'}
        className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
