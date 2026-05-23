interface FooterProps {
  settings: {
    siteName: string
    contactEmail: string
    contactPhone: string
    contactAddress: string
    facebookUrl: string
    instagramUrl: string
  }
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-noir border-t border-noir-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-xl text-white mb-4">
              <span className="text-gold">✦</span> Nos Appartements
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Des appartements de standing pour des séjours d&apos;exception à Paray le Monial, au cœur de la Bourgogne.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '#a-propos', label: 'À propos' },
                { href: '#appartements', label: 'Nos appartements' },
                { href: '#contact', label: 'Contact & Réservation' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-gray-400 text-sm hover:text-gold transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="text-gold">✉</span>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold transition-colors">
                  {settings.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="text-gold">☎</span>
                <a href={`tel:${settings.contactPhone}`} className="hover:text-gold transition-colors">
                  {settings.contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="text-gold">⚑</span>
                <span>{settings.contactAddress}</span>
              </li>
            </ul>

            {(settings.facebookUrl || settings.instagramUrl) && (
              <div className="flex gap-4 mt-6">
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gold transition-colors text-sm tracking-widest uppercase">
                    Facebook
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gold transition-colors text-sm tracking-widest uppercase">
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-noir-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {settings.siteName}. Tous droits réservés.
          </p>

          <div className="flex items-center gap-1 text-gold/30 text-xs">
            <span>✦</span><span>✦</span><span>✦</span>
          </div>

          {/* Lien admin discret */}
          <a
            href="/admin/login"
            className="text-gray-700 text-xs hover:text-gold transition-colors tracking-widest uppercase"
          >
            ⚙ Espace admin
          </a>
        </div>
      </div>
    </footer>
  )
}
