'use client'

import { useState, useEffect } from 'react'

const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80',
]

interface Props {
  images: string[]
}

export default function HeroSlideshow({ images }: Props) {
  const slides = images.length > 0 ? images : PLACEHOLDERS
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {/* Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-noir/40 to-noir" />

      {/* Indicateurs */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 2,
                background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.3)',
              }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
