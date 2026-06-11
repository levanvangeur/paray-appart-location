'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import BookingCalendar from '@/components/BookingCalendar'
import type { Apartment, Reservation } from '@/lib/types'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface Props { apartment: Apartment }

type Step = 'dates' | 'info' | 'payment' | 'done'

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function StripePaymentForm({ reservationId, onSuccess }: {
  reservationId: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!stripe || !elements) return
    setPaying(true)
    setError('')
    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservation/success?id=${reservationId}&method=stripe`,
      },
      redirect: 'if_required',
    })
    if (err) {
      setError(err.message || 'Erreur de paiement')
      setPaying(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={handlePay}
        disabled={paying || !stripe}
        className="btn-gold w-full disabled:opacity-50"
      >
        {paying ? 'Traitement...' : 'Payer par carte'}
      </button>
    </div>
  )
}

export default function BookingPageClient({ apartment }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dates')
  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: 1, message: '' })
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0
  const total = nights * apartment.pricePerNight

  const handleCalendarSelect = (ci: Date | undefined, co: Date | undefined) => {
    setCheckIn(ci)
    setCheckOut(co)
  }

  const handleSubmitInfo = async () => {
    if (!form.name || !form.email || !checkIn || !checkOut) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartmentId: apartment.id,
          guestName: form.name,
          guestEmail: form.email,
          guestPhone: form.phone,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          guests: form.guests,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur.'); setLoading(false); return }
      setReservation(data)
      setStep('payment')
    } catch {
      setError('Erreur réseau.')
    }
    setLoading(false)
  }

  const initStripe = async () => {
    if (!reservation) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/payment/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: reservation.id }),
    })
    const data = await res.json()
    if (data.clientSecret) {
      setClientSecret(data.clientSecret)
    } else {
      setError(data.error || 'Stripe non disponible.')
    }
    setLoading(false)
  }

  const initPaypal = async () => {
    if (!reservation) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/payment/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: reservation.id }),
    })
    const data = await res.json()
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl
    } else {
      setError(data.error || 'PayPal non disponible.')
    }
    setLoading(false)
  }

  const labelClass = 'block text-xs tracking-widest uppercase text-gold mb-2'
  const inputClass = 'w-full bg-noir border border-noir-border text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: steps */}
      <div className="lg:col-span-2 space-y-6">

        {/* Step 1: Dates */}
        <section className="bg-noir-card border border-noir-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-white">1. Choisissez vos dates</h2>
            {step !== 'dates' && checkIn && checkOut && (
              <button onClick={() => setStep('dates')} className="text-gold text-xs underline">Modifier</button>
            )}
          </div>
          {(step === 'dates' || !checkIn || !checkOut) ? (
            <>
              <BookingCalendar
                apartmentId={apartment.id}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={handleCalendarSelect}
              />
              {checkIn && checkOut && (
                <div className="mt-4 text-center">
                  <button onClick={() => setStep('info')} className="btn-gold">
                    Confirmer les dates →
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-300 text-sm">
              Du <strong className="text-white">{checkIn.toLocaleDateString('fr-FR')}</strong> au{' '}
              <strong className="text-white">{checkOut.toLocaleDateString('fr-FR')}</strong>{' '}
              ({nights} nuit{nights > 1 ? 's' : ''})
            </p>
          )}
        </section>

        {/* Step 2: Guest info */}
        {(step === 'info' || step === 'payment') && (
          <section className="bg-noir-card border border-noir-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-white">2. Vos coordonnées</h2>
              {step === 'payment' && (
                <button onClick={() => setStep('info')} className="text-gold text-xs underline">Modifier</button>
              )}
            </div>
            {step === 'info' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nom complet *</label>
                    <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input type="tel" className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 00 00 00 00" />
                  </div>
                  <div>
                    <label className={labelClass}>Nombre de voyageurs *</label>
                    <input type="number" min={1} max={apartment.capacity} className={inputClass} value={form.guests} onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Message (optionnel)</label>
                  <textarea rows={3} className={inputClass + ' resize-none'} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Heure d'arrivée, demandes spéciales..." />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button onClick={handleSubmitInfo} disabled={loading} className="btn-gold disabled:opacity-50">
                  {loading ? 'Vérification...' : 'Procéder au paiement →'}
                </button>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">
                <strong className="text-white">{form.name}</strong> · {form.email}
                {form.phone && ` · ${form.phone}`} · {form.guests} voyageur{form.guests > 1 ? 's' : ''}
              </p>
            )}
          </section>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && reservation && (
          <section className="bg-noir-card border border-noir-border p-6">
            <h2 className="font-serif text-xl text-white mb-6">3. Paiement sécurisé</h2>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {!clientSecret ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm mb-6">
                  Choisissez votre mode de paiement. Le montant de{' '}
                  <strong className="text-gold">{total.toFixed(2)} €</strong> sera débité immédiatement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={initStripe}
                    disabled={loading || !stripePromise}
                    className="flex items-center justify-center gap-3 border border-noir-border hover:border-gold p-4 transition-colors group disabled:opacity-40"
                  >
                    <span className="text-2xl">💳</span>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium group-hover:text-gold">Carte bancaire</div>
                      <div className="text-gray-500 text-xs">Visa, Mastercard, CB</div>
                    </div>
                  </button>
                  <button
                    onClick={initPaypal}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 border border-noir-border hover:border-gold p-4 transition-colors group"
                  >
                    <span className="text-2xl">🅿️</span>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium group-hover:text-gold">PayPal</div>
                      <div className="text-gray-500 text-xs">Compte PayPal ou carte</div>
                    </div>
                  </button>
                </div>
                {loading && <p className="text-gold text-xs animate-pulse text-center">Initialisation...</p>}
                {!stripePromise && (
                  <p className="text-yellow-600 text-xs">Stripe non configuré — contactez l&apos;hébergeur.</p>
                )}
              </div>
            ) : (
              stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'fr', appearance: { theme: 'night', variables: { colorPrimary: '#c9a84c' } } }}>
                  <StripePaymentForm
                    reservationId={reservation.id}
                    onSuccess={() => router.push(`/reservation/success?id=${reservation.id}&method=stripe`)}
                  />
                </Elements>
              )
            )}
          </section>
        )}
      </div>

      {/* Right: summary */}
      <div className="space-y-4">
        <div className="bg-noir-card border border-noir-border p-5 sticky top-28">
          <h3 className="font-serif text-lg text-white mb-4">Récapitulatif</h3>
          {apartment.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/images/appartements/${apartment.images[0]}`} alt={apartment.name} className="w-full h-40 object-cover mb-4" />
          )}
          <p className="text-gold font-serif text-base mb-1">{apartment.name}</p>
          <p className="text-gray-400 text-xs mb-4">{apartment.shortDescription}</p>

          {checkIn && checkOut ? (
            <>
              <div className="border-t border-noir-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Arrivée</span>
                  <span>{checkIn.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Départ</span>
                  <span>{checkOut.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{nights} nuit{nights > 1 ? 's' : ''} × {apartment.pricePerNight} €</span>
                  <span>{total} €</span>
                </div>
              </div>
              <div className="border-t border-noir-border mt-4 pt-4 flex justify-between">
                <span className="text-white font-medium">Total</span>
                <span className="text-gold font-serif text-xl">{total} €</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-xs">Sélectionnez vos dates pour voir le prix.</p>
          )}

          <div className="mt-4 pt-4 border-t border-noir-border text-xs text-gray-500 space-y-1">
            <p>✓ Confirmation immédiate</p>
            <p>✓ Paiement 100% sécurisé</p>
            <p>✓ Facture PDF incluse</p>
          </div>
        </div>
      </div>
    </div>
  )
}
