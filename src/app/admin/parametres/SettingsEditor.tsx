'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { SiteSettings } from '@/lib/types'

interface Props {
  settings: SiteSettings
}

export default function SettingsEditor({ settings }: Props) {
  const [form, setForm] = useState<SiteSettings>({ ...settings, heroImages: settings.heroImages ?? [] })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setStatus('saving')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) setTimeout(() => setStatus('idle'), 2500)
  }

  const onDropHero = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadError('')
    for (const file of acceptedFiles) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'hero')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm((prev) => ({ ...prev, heroImages: [...(prev.heroImages ?? []), data.filename] }))
      } else {
        setUploadError(data.error || 'Erreur upload')
      }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropHero,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
  })

  const removeHeroImage = (filename: string) => {
    setForm((prev) => ({ ...prev, heroImages: (prev.heroImages ?? []).filter((f) => f !== filename) }))
  }

  const inputClass = "w-full bg-noir border border-noir-border text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
  const labelClass = "block text-xs tracking-widest uppercase text-gold mb-2"

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="bg-noir-card border border-noir-border p-6 space-y-5">
      <h2 className="font-serif text-xl text-white border-b border-noir-border pb-4">{title}</h2>
      {children}
    </section>
  )

  return (
    <div className="space-y-8 max-w-3xl">

      {/* DIAPORAMA HERO */}
      <Section title="📷 Photos du diaporama (page d'accueil)">
        <p className="text-gray-400 text-sm">
          Ces photos défilent en fondu sur la page d&apos;accueil. Ajoutez au moins 2 photos pour activer le diaporama.
        </p>

        {/* Photos actuelles */}
        {(form.heroImages ?? []).length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(form.heroImages ?? []).map((img, i) => (
              <div key={img} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/hero/${img}`} alt={`Hero ${i + 1}`} className="w-full h-24 object-cover" />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-gold text-noir text-xs px-1.5 py-0.5">1re photo</div>
                )}
                <div className="absolute inset-0 bg-noir/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => removeHeroImage(img)}
                    className="text-red-400 text-xs border border-red-400/50 px-2 py-1 hover:bg-red-400/10 transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Zone de dépôt */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-gold bg-gold/5' : 'border-noir-border hover:border-gold/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-gold text-3xl mb-3">↑</div>
          <p className="text-gray-400 text-sm mb-1">
            {isDragActive ? 'Déposez ici...' : 'Glissez vos photos ou cliquez pour sélectionner'}
          </p>
          <p className="text-gray-600 text-xs">JPG, PNG, WEBP · Max 10 Mo</p>
          {uploading && <p className="text-gold text-xs mt-3 animate-pulse">Téléchargement en cours...</p>}
          {uploadError && <p className="text-red-400 text-xs mt-3">{uploadError}</p>}
        </div>

        <p className="text-gray-600 text-xs">
          N&apos;oubliez pas de cliquer sur <strong className="text-gray-400">«&nbsp;Enregistrer&nbsp;»</strong> après avoir ajouté ou retiré des photos.
        </p>
      </Section>

      {/* HERO TEXTES */}
      <Section title="Page d'accueil — Textes du hero">
        <div>
          <label className={labelClass}>Grand titre</label>
          <input name="heroTitle" value={form.heroTitle} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sous-titre</label>
          <textarea name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} rows={2} className={inputClass + ' resize-none'} />
        </div>
        <div>
          <label className={labelClass}>Tagline (sous le nom)</label>
          <input name="siteTagline" value={form.siteTagline} onChange={handleChange} className={inputClass} />
        </div>
      </Section>

      {/* À PROPOS */}
      <Section title="Section À propos">
        <div>
          <label className={labelClass}>Titre</label>
          <input name="aboutTitle" value={form.aboutTitle} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Texte</label>
          <textarea name="aboutText" value={form.aboutText} onChange={handleChange} rows={5} className={inputClass + ' resize-none'} />
        </div>
      </Section>

      {/* CONTACT */}
      <Section title="Coordonnées de contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Adresse / Localisation</label>
            <input name="contactAddress" value={form.contactAddress} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </Section>

      {/* RÉSEAUX */}
      <Section title="Réseaux sociaux">
        <div>
          <label className={labelClass}>Facebook (URL)</label>
          <input name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Instagram (URL)</label>
          <input name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." className={inputClass} />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO — Référencement">
        <div>
          <label className={labelClass}>Nom du site</label>
          <input name="siteName" value={form.siteName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description (Google)</label>
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className={inputClass + ' resize-none'} />
        </div>
      </Section>

      {/* SAVE */}
      <div className="flex items-center gap-4 pb-8">
        <button onClick={handleSave} disabled={status === 'saving'} className="btn-gold disabled:opacity-50">
          {status === 'saving' ? 'Sauvegarde...' : 'Enregistrer tous les paramètres'}
        </button>
        {status === 'saved' && <span className="text-green-400 text-sm">✓ Enregistré</span>}
        {status === 'error' && <span className="text-red-400 text-sm">Erreur lors de la sauvegarde.</span>}
      </div>
    </div>
  )
}
