'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="text-gold text-4xl mb-4">✦</div>
          <h1 className="font-serif text-3xl text-white mb-2">Espace Administrateur</h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Nos Appartements · Paray le Monial</p>
        </div>

        <div className="bg-noir-card border border-noir-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-gold mb-2">Identifiant</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-noir border border-noir-border text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-gold mb-2">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-noir border border-noir-border text-white px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">Identifiants incorrects.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-gold w-full disabled:opacity-50"
            >
              {status === 'loading' ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-gray-500 text-xs hover:text-gold transition-colors tracking-widest uppercase">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  )
}
