'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: '◈' },
  { href: '/admin/appartements', label: 'Appartements', icon: '⊞' },
  { href: '/admin/parametres', label: 'Paramètres du site', icon: '⚙' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-noir-card border-r border-noir-border flex flex-col">
      <div className="p-6 border-b border-noir-border">
        <div className="flex items-center gap-3">
          <span className="text-gold text-xl">✦</span>
          <div>
            <div className="font-serif text-sm text-white">Administration</div>
            <div className="text-xs text-gray-500">Paray le Monial</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                active
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-gray-400 hover:text-white hover:bg-noir-border border-l-2 border-transparent'
              }`}
            >
              <span className={active ? 'text-gold' : 'text-gray-600'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-noir-border space-y-2">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-gold transition-colors">
          <span>↗</span> Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-400 transition-colors text-left"
        >
          <span>⏻</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}
