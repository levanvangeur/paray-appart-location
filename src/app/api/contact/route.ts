import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getApartmentById, getSettings } from '@/lib/data'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, apartmentId, checkIn, checkOut, guests, message } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Nom et email requis.' }, { status: 400 })
  }

  const settings = getSettings()
  const apartment = apartmentId ? getApartmentById(apartmentId) : null

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #fff; padding: 40px;">
      <h2 style="color: #C9A84C; font-size: 24px; margin-bottom: 8px;">Nouvelle demande de réservation</h2>
      <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 32px;">
        Nos Appartements à Paray le Monial
      </p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Nom</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${email}</td>
        </tr>
        ${phone ? `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Téléphone</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${phone}</td>
        </tr>` : ''}
        ${apartment ? `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Appartement</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${apartment.name}</td>
        </tr>` : ''}
        ${checkIn ? `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Arrivée</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${checkIn}</td>
        </tr>` : ''}
        ${checkOut ? `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Départ</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${checkOut}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Voyageurs</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #fff;">${guests}</td>
        </tr>
        ${message ? `<tr>
          <td style="padding: 12px 0; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Message</td>
          <td style="padding: 12px 0; color: #fff;">${message}</td>
        </tr>` : ''}
      </table>

      <p style="margin-top: 32px; color: #666; font-size: 12px;">
        Répondez directement à cet email pour contacter ${name}.
      </p>
    </div>
  `

  // If SMTP is not configured, just log and return success
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const contactEmail = process.env.CONTACT_EMAIL || settings.contactEmail

  if (!smtpUser || !smtpPass) {
    console.log('Contact form submission (SMTP not configured):', { name, email, apartment: apartment?.name, checkIn, checkOut, guests, message })
    return NextResponse.json({ ok: true })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"Site de Réservation" <${smtpUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `Demande de réservation — ${apartment ? apartment.name : 'Appartement non précisé'} — ${name}`,
      html: htmlContent,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Impossible d\'envoyer le message.' }, { status: 500 })
  }
}
