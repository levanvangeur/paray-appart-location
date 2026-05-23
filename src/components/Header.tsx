'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#a-propos', label: 'À propos' },
    { href: '#appartements', label: 'Appartements' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-noir/95 backdrop-blur-md border-b border-noir-border shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-serif text-xl text-white hover:text-gold transition-colors">
          <span className="text-gold">✦</span>{' '}
          <span className="hidden sm:inline">Nos Appartements</span>
          <span className="sm:hidden">Appartements</span>
          <span className="text-gold/70 text-sm ml-2 font-sans font-light tracking-widest uppercase hidden md:inline">
            Paray le Monial
          </span>
        </a>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-widest uppercase text-gray-300 hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className="btn-gold text-xs py-2 px-6">Réserver</a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white hover:text-gold transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-noir border-t border-noir-border">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm tracking-widest uppercase text-gray-300 hover:text-gold transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a href="#contact" className="btn-gold text-center text-xs" onClick={() => setMenuOpen(false)}>
              Réserver
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
