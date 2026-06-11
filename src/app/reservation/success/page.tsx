'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const id = params.get('id') || ''
  const method = params.get('method') || ''
  const orderId = params.get('token') || '' // PayPal

  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    // If PayPal redirect, capture the order
    if (method === 'paypal' && orderId && id) {
      fetch('/api/payment/paypal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reservationId: id }),
      }).then(() => setConfirmed(true))
    } else {
      setConfirmed(true)
    }
  }, [method, orderId, id])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="text-6xl">✓</div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-px bg-gold" />
          <span className="text-xs tracking-[0.3em] uppercase text-gold">Réservation confirmée</span>
          <div className="w-12 h-px bg-gold" />
        </div>
        <h1 className="font-serif text-3xl text-white">Merci pour votre réservation !</h1>
        <p className="text-gray-400">
          Un email de confirmation vous a été envoyé. Votre facture est disponible ci-dessous.
        </p>
        {confirmed && id && (
          <a
            href={`/api/invoice/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2"
          >
            📄 Télécharger ma facture PDF
          </a>
        )}
        <div>
          <Link href="/" className="btn-outline-gold">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
