'use client'

import { useState, useEffect, useRef } from 'react'
import type { Apartment } from '@/lib/types'

const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=900&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=900&fit=crop&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&h=900&fit=crop&q=80',
]

interface Props {
  apartment: Apartment
  index: number
}

export default function ApartmentSection({ apartment, index }: Props) {
  const images =
    apartment.images.length > 0
      ? apartment.images.map((f) => `/images/appartements/${f}`)
      : [PLACEHOLDERS[index % PLACEHOLDERS.length]]

  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  // Crossfade slideshow
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setCurrent((p) => (p + 1) % images.length), 4500)
    return () => clearInterval(timer)
  }, [images.length])

  // Animation au défilement
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (infoRef.current) observer.observe(infoRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div id={`apt-${apartment.id}`}>

      {/* ── PHOTO PLEINE LARGEUR ── */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0"
            style={{ opacity: i === current ? 1 : 0, transition: 'opacity 1.4s ease-in-out' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={apartment.name} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-noir" />

        {/* Prix */}
        <div className="absolute top-6 right-6 bg-gold text-noir text-sm font-bold tracking-widest uppercase px-4 py-2 z-10">
          {apartment.pricePerNight}€ / nuit
        </div>

        {/* Indicateurs photos */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 28 : 8,
                  height: 2,
                  background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.4s',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── INFOS — apparaissent avec transition au défilement ── */}
      <div
        ref={infoRef}
        className="py-16 px-6 max-w-3xl mx-auto text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(48px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-px bg-gold" />
          <span className="text-xs tracking-[0.3em] uppercase text-gold">Appartement</span>
          <div className="w-10 h-px bg-gold" />
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-white mb-5">{apartment.name}</h2>

        <p className="text-gray-400 leading-relaxed text-base mb-10 max-w-xl mx-auto">
          {apartment.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-noir-border max-w-sm mx-auto mb-10">
          <div>
            <div className="font-serif text-3xl text-gold">{apartment.surface}</div>
            <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">m²</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-gold">{apartment.bedrooms}</div>
            <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">
              {apartment.bedrooms > 1 ? 'Chambres' : 'Chambre'}
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl text-gold">{apartment.capacity}</div>
            <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">Personnes</div>
          </div>
        </div>

        {/* Équipements */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {apartment.amenities.map((a) => (
            <span key={a} className="text-xs text-gray-400 border border-noir-border px-3 py-1.5">
              {a}
            </span>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          {apartment.available ? (
            <a href={`/reservation/${apartment.slug}`} className="btn-gold">
              Réserver maintenant
            </a>
          ) : (
            <span className="btn-gold opacity-40 cursor-not-allowed">Indisponible</span>
          )}
        </div>
      </div>

      {/* ── SÉPARATION DORÉE ── */}
      <div className="flex items-center justify-center gap-6 px-6 pb-6">
        <div className="h-px bg-noir-border flex-1 max-w-xs" />
        <span className="text-gold/30 text-sm">✦</span>
        <div className="h-px bg-noir-border flex-1 max-w-xs" />
      </div>

    </div>
  )
}
