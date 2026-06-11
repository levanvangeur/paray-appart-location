'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

interface Props {
  apartmentId: string
  checkIn: Date | undefined
  checkOut: Date | undefined
  onSelect: (checkIn: Date | undefined, checkOut: Date | undefined) => void
}

export default function BookingCalendar({ apartmentId, checkIn, checkOut, onSelect }: Props) {
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn')

  useEffect(() => {
    fetch(`/api/reservations?apartmentId=${apartmentId}`)
      .then((r) => r.json())
      .then((data) => {
        const dates = (data.blocked || []).map((d: string) => new Date(d + 'T12:00:00'))
        setBlockedDates(dates)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apartmentId])

  const isBlocked = (date: Date) =>
    blockedDates.some(
      (b) =>
        b.getFullYear() === date.getFullYear() &&
        b.getMonth() === date.getMonth() &&
        b.getDate() === date.getDate()
    )

  const handleDayClick = (day: Date) => {
    if (isBlocked(day)) return
    if (day < new Date(new Date().toDateString())) return

    if (selecting === 'checkIn' || !checkIn) {
      onSelect(day, undefined)
      setSelecting('checkOut')
    } else {
      if (day <= checkIn) {
        onSelect(day, undefined)
        setSelecting('checkOut')
        return
      }
      // Check no blocked dates between checkIn and day
      let hasBlocked = false
      for (let d = new Date(checkIn); d < day; d.setDate(d.getDate() + 1)) {
        if (isBlocked(d)) { hasBlocked = true; break }
      }
      if (hasBlocked) {
        onSelect(day, undefined)
        setSelecting('checkOut')
        return
      }
      onSelect(checkIn, day)
      setSelecting('checkIn')
    }
  }

  const selected = checkIn && checkOut
    ? { from: checkIn, to: checkOut }
    : checkIn
    ? { from: checkIn, to: undefined }
    : undefined

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gold/60 text-sm animate-pulse">
        Chargement des disponibilités...
      </div>
    )
  }

  return (
    <div className="booking-calendar">
      <div className="text-xs text-gold/70 mb-3 text-center tracking-wide">
        {selecting === 'checkIn' ? '→ Sélectionnez la date d\'arrivée' : '→ Sélectionnez la date de départ'}
      </div>
      <div className="flex gap-3 justify-center mb-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gold inline-block" /> Sélectionné
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-800/80 inline-block" /> Indisponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-700 inline-block" /> Passé
        </span>
      </div>
      <DayPicker
        mode="range"
        selected={selected as { from: Date; to: Date | undefined } | undefined}
        onDayClick={handleDayClick}
        locale={fr}
        numberOfMonths={2}
        startMonth={new Date()}
        disabled={[
          ...blockedDates,
          { before: new Date() },
        ]}
        modifiers={{ blocked: blockedDates }}
        modifiersClassNames={{
          blocked: 'day-blocked',
          selected: 'day-selected',
        }}
        styles={{
          months: { gap: '1rem' },
        }}
      />
      <style>{`
        .booking-calendar .rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: #c9a84c;
          --rdp-background-color: rgba(201,168,76,0.15);
          margin: 0 auto;
          color: #e5e5e5;
        }
        .booking-calendar .rdp-head_cell { color: #c9a84c; font-size: 0.7rem; }
        .booking-calendar .rdp-caption_label { color: #fff; font-family: Georgia, serif; }
        .booking-calendar .rdp-nav_button { color: #c9a84c; }
        .booking-calendar .rdp-day { color: #e5e5e5; border-radius: 4px; }
        .booking-calendar .rdp-day:hover:not(.rdp-day_disabled) { background: rgba(201,168,76,0.2); }
        .booking-calendar .rdp-day_disabled { color: #444; cursor: not-allowed; }
        .booking-calendar .day-blocked { background: rgba(153,27,27,0.4) !important; color: #f87171 !important; text-decoration: line-through; cursor: not-allowed; }
        .booking-calendar .rdp-day_selected { background: #c9a84c !important; color: #1a1a1a !important; font-weight: bold; }
        .booking-calendar .rdp-day_range_middle { background: rgba(201,168,76,0.2) !important; color: #fff !important; border-radius: 0; }
        .booking-calendar .rdp-day_range_start, .booking-calendar .rdp-day_range_end { background: #c9a84c !important; color: #1a1a1a !important; border-radius: 4px; }
      `}</style>
    </div>
  )
}
