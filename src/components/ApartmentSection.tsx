'use client'

import { useState, useEffect } from 'react'
import type { Apartment } from '@/lib/types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=700&fit=crop&q=80'

interface Props {
  apartment: Apartment
  reversed: boolean
}

export default function ApartmentSection({ apartment, reversed }: Props) {
  const images =
    apartment.images.length > 0
      ? apartment.images.map((f) => `/images/appartements/${f}`)
      : [PLACEHOLDER]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setCurrent((p) => (p + 1) % images.length), 4000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div
      id={`apt-${apartment.id}`}
      className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[520px]`}
    >
      {/* Photo */}
      <div className="relative w-full lg:w-1/2 min-h-[320px] lg:min-h-0 overflow-hidden">
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0"
            style={{ opacity: i === current ? 1 : 0, transition: 'opacity 1.2s ease-in-out' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={apartment.name} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Prix */}
        <div className="absolute top-5 right-5 bg-gold text-noir text-xs font-bold tracking-widest uppercase px-3 py-2 z-10">
          {apartment.pricePerNight}€ / nuit
        </div>

        {/* Indicateurs photos */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300"
                style={{
                  width: i === current ? 20 : 6,
                  height: 2,
                  background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={`w-full lg:w-1/2 bg-noir-card flex items-center ${reversed ? 'lg:pr-0 lg:pl-0' : ''}`}>
        <div className="p-10 lg:p-16 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gold" />
            <span className="text-xs tracking-[0.25em] uppercase text-gold">Appartement</span>
          </div>

          <h2 className="font-serif text-3xl lg:text-4xl text-white mb-4">{apartment.name}</h2>
          <p className="text-gray-400 leading-relaxed mb-8">{apartment.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-noir-border">
            <div className="text-center">
              <div className="font-serif text-2xl text-gold">{apartment.surface}</div>
              <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">m²</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl text-gold">{apartment.bedrooms}</div>
              <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">{apartment.bedrooms > 1 ? 'Chambres' : 'Chambre'}</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl text-gold">{apartment.capacity}</div>
              <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">Personnes</div>
            </div>
          </div>

          {/* Équipements */}
          <div className="flex flex-wrap gap-2 mb-8">
            {apartment.amenities.slice(0, 6).map((a) => (
              <span key={a} className="text-xs text-gray-400 border border-noir-border px-3 py-1.5">
                {a}
              </span>
            ))}
            {apartment.amenities.length > 6 && (
              <span className="text-xs text-gold/60 border border-gold/20 px-3 py-1.5">
                +{apartment.amenities.length - 6} autres
              </span>
            )}
          </div>

          <a
            href="#contact"
            className="btn-gold inline-flex"
            onClick={() => {
              const el = document.getElementById('apt-select')
              if (el instanceof HTMLSelectElement) {
                el.value = apartment.id
              }
            }}
          >
            Demander une réservation
          </a>
        </div>
      </div>
    </div>
  )
}
