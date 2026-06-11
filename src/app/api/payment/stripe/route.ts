import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getReservationById, updateReservation } from '@/lib/data'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY manquant')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Create payment intent for a reservation
export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json()
    const reservation = getReservationById(reservationId)
    if (!reservation) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(reservation.totalPrice * 100), // centimes
      currency: 'eur',
      metadata: {
        reservationId: reservation.id,
        apartmentName: reservation.apartmentName,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        invoiceNumber: reservation.invoiceNumber || '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Stripe webhook — confirm payment
export async function PUT(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature invalide'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const reservationId = pi.metadata?.reservationId
    if (reservationId) {
      updateReservation(reservationId, {
        status: 'confirmed',
        paymentMethod: 'stripe',
        paymentId: pi.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}
