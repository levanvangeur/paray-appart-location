import { NextRequest, NextResponse } from 'next/server'
import { getReservationById, getSettings } from '@/lib/data'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const reservation = getReservationById(id)
  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })
  if (reservation.status !== 'confirmed') {
    return NextResponse.json({ error: 'Facture disponible après paiement.' }, { status: 403 })
  }

  const settings = getSettings()
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)

  const gold = rgb(0.78, 0.64, 0.25)
  const dark = rgb(0.1, 0.1, 0.1)
  const gray = rgb(0.5, 0.5, 0.5)
  const lightGray = rgb(0.95, 0.95, 0.95)

  // Header background
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.08, 0.08, 0.08) })

  // Company name
  page.drawText(settings.siteName || 'Logements Paray', {
    x: 40, y: height - 55, size: 22, font: helveticaBold, color: gold,
  })
  page.drawText(settings.siteTagline || '', {
    x: 40, y: height - 75, size: 10, font: helvetica, color: rgb(0.7, 0.7, 0.7),
  })
  page.drawText(settings.contactAddress || '', {
    x: 40, y: height - 92, size: 9, font: helvetica, color: rgb(0.6, 0.6, 0.6),
  })
  page.drawText(`${settings.contactEmail || ''} · ${settings.contactPhone || ''}`, {
    x: 40, y: height - 106, size: 9, font: helvetica, color: rgb(0.6, 0.6, 0.6),
  })

  // Invoice title
  page.drawText('FACTURE', {
    x: 400, y: height - 50, size: 28, font: helveticaBold, color: gold,
  })
  page.drawText(`N° ${reservation.invoiceNumber || reservation.id.slice(0, 8).toUpperCase()}`, {
    x: 400, y: height - 75, size: 11, font: helvetica, color: rgb(0.8, 0.8, 0.8),
  })
  page.drawText(`Date : ${new Date(reservation.createdAt).toLocaleDateString('fr-FR')}`, {
    x: 400, y: height - 92, size: 9, font: helvetica, color: rgb(0.7, 0.7, 0.7),
  })

  // Guest info box
  let y = height - 175
  page.drawRectangle({ x: 40, y: y - 10, width: 220, height: 80, color: lightGray })
  page.drawText('DESTINATAIRE', { x: 50, y: y + 55, size: 8, font: helveticaBold, color: gold })
  page.drawText(reservation.guestName, { x: 50, y: y + 38, size: 11, font: helveticaBold, color: dark })
  if (reservation.guestEmail) page.drawText(reservation.guestEmail, { x: 50, y: y + 22, size: 9, font: helvetica, color: gray })
  if (reservation.guestPhone) page.drawText(reservation.guestPhone, { x: 50, y: y + 8, size: 9, font: helvetica, color: gray })

  // Stay info box
  page.drawRectangle({ x: 300, y: y - 10, width: 255, height: 80, color: lightGray })
  page.drawText('DÉTAILS DU SÉJOUR', { x: 310, y: y + 55, size: 8, font: helveticaBold, color: gold })
  page.drawText(reservation.apartmentName, { x: 310, y: y + 38, size: 11, font: helveticaBold, color: dark })
  page.drawText(`Arrivée : ${new Date(reservation.checkIn).toLocaleDateString('fr-FR')}`, { x: 310, y: y + 22, size: 9, font: helvetica, color: gray })
  page.drawText(`Départ  : ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')}`, { x: 310, y: y + 8, size: 9, font: helvetica, color: gray })

  // Table header
  y -= 50
  page.drawRectangle({ x: 40, y: y - 5, width: 515, height: 25, color: rgb(0.08, 0.08, 0.08) })
  page.drawText('Description', { x: 50, y: y + 5, size: 9, font: helveticaBold, color: gold })
  page.drawText('Qté', { x: 340, y: y + 5, size: 9, font: helveticaBold, color: gold })
  page.drawText('Prix unitaire', { x: 390, y: y + 5, size: 9, font: helveticaBold, color: gold })
  page.drawText('Total', { x: 490, y: y + 5, size: 9, font: helveticaBold, color: gold })

  // Table row
  y -= 30
  const pricePerNight = reservation.nights > 0 ? reservation.totalPrice / reservation.nights : reservation.totalPrice
  page.drawText(`Nuit(s) — ${reservation.apartmentName}`, { x: 50, y, size: 9, font: helvetica, color: dark })
  page.drawText(`${reservation.nights}`, { x: 348, y, size: 9, font: helvetica, color: dark })
  page.drawText(`${pricePerNight.toFixed(2)} €`, { x: 390, y, size: 9, font: helvetica, color: dark })
  page.drawText(`${reservation.totalPrice.toFixed(2)} €`, { x: 488, y, size: 9, font: helveticaBold, color: dark })

  // Separator
  y -= 20
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) })

  // Total
  y -= 20
  page.drawRectangle({ x: 380, y: y - 8, width: 175, height: 30, color: rgb(0.08, 0.08, 0.08) })
  page.drawText('TOTAL TTC', { x: 390, y: y + 5, size: 10, font: helveticaBold, color: gold })
  page.drawText(`${reservation.totalPrice.toFixed(2)} €`, { x: 470, y: y + 5, size: 12, font: helveticaBold, color: gold })

  // Payment method
  y -= 50
  const pmLabel: Record<string, string> = { stripe: 'Carte bancaire (Stripe)', paypal: 'PayPal', pending: 'En attente' }
  page.drawText(`Mode de paiement : ${pmLabel[reservation.paymentMethod] || reservation.paymentMethod}`, {
    x: 40, y, size: 9, font: helvetica, color: gray,
  })
  page.drawText(`Statut : ${reservation.status === 'confirmed' ? 'Payé ✓' : reservation.status}`, {
    x: 40, y: y - 14, size: 9, font: helvetica, color: reservation.status === 'confirmed' ? rgb(0.2, 0.7, 0.3) : gray,
  })

  // Footer
  page.drawLine({ start: { x: 40, y: 60 }, end: { x: 555, y: 60 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) })
  page.drawText('Merci de votre confiance. Cette facture fait foi de votre paiement.', {
    x: 40, y: 45, size: 8, font: helvetica, color: gray,
  })
  page.drawText(`${settings.siteName || 'Logements Paray'} · ${settings.contactAddress || ''} · ${settings.contactEmail || ''}`, {
    x: 40, y: 30, size: 7, font: helvetica, color: rgb(0.7, 0.7, 0.7),
  })

  const pdfBytes = await doc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${reservation.invoiceNumber || reservation.id}.pdf"`,
    },
  })
}
