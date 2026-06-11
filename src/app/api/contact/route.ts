import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getApartmentById, getSettings } from '@/lib/data'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, apartmentId, checkIn, checkOut, guests, message } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Nom et email requis.' }, { status: 400 })
  }

  const settings = getSettings()
  const apartment = apartmentId ? getApartmentById(apartmentId) : null
  const contactEmail = process.env.CONTACT_EMAIL || settings.contactEmail

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #fff; padding: 40px; border: 1px solid #2A2A2A;">
      <div style="text-align:center; margin-bottom: 32px;">
        <div style="color: #C9A84C; font-size: 28px; margin-bottom: 8px;">✦</div>
        <h2 style="color: #C9A84C; font-size: 22px; margin: 0 0 4px;">Nouvelle demande de réservation</h2>
        <p style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0;">
          Nos Appartements · Paray le Monial
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; width: 130px;">Nom</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td>
        </tr>
        ${phone ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Téléphone</td><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${phone}</td></tr>` : ''}
        ${apartment ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Appartement</td><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff; font-weight: bold;">${apartment.name}</td></tr>` : ''}
        ${checkIn ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Arrivée</td><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${checkIn}</td></tr>` : ''}
        ${checkOut ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Départ</td><td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${checkOut}</td></tr>` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Voyageurs</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${guests}</td>
        </tr>
        ${message ? `<tr><td style="padding: 12px 0; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; padding-top: 16px;">Message</td><td style="padding: 12px 0; color: #ccc; padding-top: 16px;">${message}</td></tr>` : ''}
      </table>
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #2A2A2A; text-align: center;">
        <a href="mailto:${email}" style="display:inline-block; background:#C9A84C; color:#0D0D0D; padding: 12px 28px; text-decoration:none; font-size:12px; letter-spacing:2px; text-transform:uppercase; font-weight:bold;">
          Répondre à ${name}
        </a>
      </div>
    </div>
  `

  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    console.log('📬 Formulaire reçu (RESEND_API_KEY manquante) :', { name, email, apartment: apartment?.name })
    return NextResponse.json({ ok: true })
  }

  try {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'Site Réservation <onboarding@resend.dev>',
      to: [contactEmail],
      replyTo: email,
      subject: `Demande de réservation — ${apartment ? apartment.name : 'Non précisé'} — ${name}`,
      html: htmlContent,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 })
  }
}
