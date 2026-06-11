import { NextRequest, NextResponse } from 'next/server'
import { getReservationById, updateReservation } from '@/lib/data'

const PAYPAL_API = process.env.PAYPAL_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || ''
  const secret = process.env.PAYPAL_CLIENT_SECRET || ''
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

// Create PayPal order
export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json()
    const reservation = getReservationById(reservationId)
    if (!reservation) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })
    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: 'PayPal non configuré.' }, { status: 503 })
    }

    const accessToken = await getAccessToken()
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: reservation.id,
          description: `${reservation.apartmentName} — ${reservation.checkIn} au ${reservation.checkOut}`,
          amount: {
            currency_code: 'EUR',
            value: reservation.totalPrice.toFixed(2),
          },
          custom_id: reservation.id,
        }],
        application_context: {
          return_url: `${origin}/reservation/success?id=${reservation.id}&method=paypal`,
          cancel_url: `${origin}/reservation/annulation?id=${reservation.id}`,
          brand_name: 'Logements Paray',
          locale: 'fr-FR',
          user_action: 'PAY_NOW',
        },
      }),
    })

    const order = await res.json()
    const approvalUrl = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href
    return NextResponse.json({ orderId: order.id, approvalUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur PayPal'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Capture PayPal order after approval
export async function PUT(req: NextRequest) {
  try {
    const { orderId, reservationId } = await req.json()
    const accessToken = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const capture = await res.json()
    if (capture.status === 'COMPLETED') {
      updateReservation(reservationId, {
        status: 'confirmed',
        paymentMethod: 'paypal',
        paymentId: orderId,
      })
    }

    return NextResponse.json(capture)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur PayPal'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
