'use client'

import { useState, useRef, useEffect } from 'react'
import type { SiteSettings } from '@/lib/types'
import { uploadFile } from '@/lib/uploadFile'

interface Props {
  settings: SiteSettings
}

export default function SettingsEditor({ settings }: Props) {
  const [form, setForm] = useState<SiteSettings>({ ...settings, heroImages: settings.heroImages ?? [] })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [heroStatus, setHeroStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const formRef = useRef(form)
  const heroFileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { formRef.current = form }, [form])

  // Bloquer le navigateur d'ouvrir les fichiers glissés hors de la zone
  useEffect(() => {
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop', prevent)
    }
  }, [])

  const saveHeroImages = async (images: string[]) => {
    setHeroStatus('saving')
    const updated = { ...formRef.current, heroImages: images }
    setForm(updated)
    formRef.current = updated
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      setHeroStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setHeroStatus('idle'), 2500)
    } catch {
      setHeroStatus('error')
    }
  }

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

  const processHeroFiles = async (files: FileList | File[]) => {
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
    const MAX = 10 * 1024 * 1024
    const valid: File[] = []
    const errors: string[] = []
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) { errors.push(`${file.name} : format non supporté`); continue }
      if (file.size > MAX) { errors.push(`${file.name} : trop lourd (max 10 Mo)`); continue }
      valid.push(file)
    }
    if (errors.length) { setUploadError(errors.join(' | ')); return }
    setUploading(true)
    setUploadError('')
    const newImages = [...(formRef.current.heroImages ?? [])]
    for (const file of valid) {
      try {
        const result = await uploadFile(file, 'hero')
        if ('filename' in result) {
          newImages.push(result.filename)
        } else {
          setUploadError(result.error)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setUploadError(`Erreur: ${msg}`)
      }
    }
    setUploading(false)
    if (newImages.length > (formRef.current.heroImages ?? []).length) {
      await saveHeroImages(newImages)
    }
  }

  const removeHeroImage = (filename: string) => {
    const newImages = (formRef.current.heroImages ?? []).filter((f) => f !== filename)
    saveHeroImages(newImages)
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
        <div className="text-xs mb-2">
          {heroStatus === 'saving' && <span className="text-gold animate-pulse">Sauvegarde automatique...</span>}
          {heroStatus === 'saved' && <span className="text-green-400">✓ Photos sauvegardées automatiquement</span>}
          {heroStatus === 'error' && <span className="text-red-400">Erreur de sauvegarde</span>}
        </div>
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

        {/* Upload zone */}
        <input
          ref={heroFileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) { processHeroFiles(e.target.files); e.target.value = '' } }}
        />
        <div
          className={`border-2 border-dashed p-10 text-center transition-colors ${
            isDragOver ? 'border-gold bg-gold/5' : 'border-gold/40'
          }`}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); if (e.dataTransfer.files?.length) processHeroFiles(e.dataTransfer.files) }}
        >
          <div className="text-gold text-4xl mb-4">📷</div>
          <p className="text-white text-sm font-medium mb-3">
            {isDragOver ? 'Déposez ici ↓' : 'Glissez vos photos ici ou cliquez le bouton'}
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => heroFileInputRef.current?.click()}
            className="btn-gold text-xs"
          >
            {uploading ? '⟳ Transfert en cours...' : '📁 Choisir des photos'}
          </button>
          <p className="text-gray-600 text-xs mt-4">JPG · PNG · WEBP · Max 10 Mo</p>
        </div>

        {uploadError && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-red-300 text-sm font-medium">Erreur d&apos;upload</p>
              <p className="text-red-400 text-xs mt-1">{uploadError}</p>
              {uploadError.includes('Session') && (
                <a href="/admin/login" className="text-gold text-xs underline mt-2 inline-block">→ Se reconnecter</a>
              )}
            </div>
            <button onClick={() => setUploadError('')} className="ml-auto text-red-400/60 hover:text-red-400 text-lg">✕</button>
          </div>
        )}
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
