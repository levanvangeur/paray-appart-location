'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Apartment } from '@/lib/types'
import { uploadFile } from '@/lib/uploadFile'

interface Props {
  apartment: Apartment
}

const AMENITIES_SUGGESTIONS = [
  'WiFi haut débit', 'Cuisine équipée', 'Parking privé', 'Parking', 'Linge de maison',
  'TV écran plat', 'Lave-linge', 'Lave-vaisselle', 'Climatisation', 'Terrasse', 'Balcon',
  'Jacuzzi', 'Lit bébé disponible', 'Chargeur voiture électrique', 'Coffre-fort',
]

export default function ApartmentEditor({ apartment }: Props) {
  const [form, setForm] = useState<Apartment>({ icalUrls: {}, ...apartment })
  const [newAmenity, setNewAmenity] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Ref toujours à jour pour éviter les closures périmées
  const formRef = useRef(form)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !form.amenities.includes(amenity)) {
      setForm((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }))
    }
    setNewAmenity('')
  }

  const removeAmenity = (amenity: string) => {
    setForm((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== amenity) }))
  }

  // Sauvegarde des photos immédiatement (sans passer par le bouton principal)
  const savePhotos = async (images: string[]) => {
    setPhotoStatus('saving')
    try {
      const res = await fetch('/api/admin/appartements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formRef.current, images }),
      })
      if (res.ok) {
        setForm((prev) => ({ ...prev, images }))
        formRef.current = { ...formRef.current, images }
        setPhotoStatus('saved')
        setTimeout(() => setPhotoStatus('idle'), 2500)
      } else {
        setPhotoStatus('error')
      }
    } catch {
      setPhotoStatus('error')
    }
  }

  const removeImage = async (filename: string) => {
    const newImages = formRef.current.images.filter((i) => i !== filename)
    await savePhotos(newImages)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setUploading(true)
    setUploadError('')

    const newImages = [...formRef.current.images]

    for (const file of acceptedFiles) {
      try {
        const result = await uploadFile(file, 'appartement', apartment.id)
        if ('filename' in result) {
          newImages.push(result.filename)
        } else {
          const msg = result.error || 'Erreur inconnue'
          if (msg.includes('autoris') || msg.includes('401')) {
            setUploadError('Session expirée — veuillez vous déconnecter et vous reconnecter, puis réessayer.')
          } else {
            setUploadError(msg)
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setUploadError(`Erreur réseau: ${msg}`)
      }
    }

    setUploading(false)

    if (newImages.length > formRef.current.images.length) {
      savePhotos(newImages)
    }
  }, [apartment.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (files) => {
      const reasons = files.map(f =>
        f.errors.map(e => e.code === 'file-too-large' ? 'Fichier trop lourd (max 10 Mo)' :
          e.code === 'file-invalid-type' ? 'Format non supporté (JPG, PNG, WEBP uniquement)' : e.message
        ).join(', ')
      ).join(' | ')
      setUploadError(reasons || 'Fichier refusé.')
    },
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  })

  const handleSave = async () => {
    setStatus('saving')

    const res = await fetch('/api/admin/appartements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
    }
  }

  const inputClass = "w-full bg-noir border border-noir-border text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
  const labelClass = "block text-xs tracking-widest uppercase text-gold mb-2"

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Basic info */}
      <section className="bg-noir-card border border-noir-border p-6">
        <h2 className="font-serif text-xl text-white mb-6">Informations générales</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nom de l&apos;appartement</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input name="slug" value={form.slug} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description courte</label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description complète</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} className={inputClass + ' resize-none'} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-noir-card border border-noir-border p-6">
        <h2 className="font-serif text-xl text-white mb-6">Caractéristiques</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Surface (m²)</label>
            <input type="number" name="surface" value={form.surface} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Capacité (pers.)</label>
            <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Chambres</label>
            <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Salles de bain</label>
            <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prix / nuit (€)</label>
            <input type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="flex gap-6 mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="available" checked={form.available} onChange={handleCheckbox}
              className="w-4 h-4 accent-gold" />
            <span className="text-gray-300 text-sm">Disponible à la réservation</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleCheckbox}
              className="w-4 h-4 accent-gold" />
            <span className="text-gray-300 text-sm">Coup de cœur (mis en avant)</span>
          </label>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-noir-card border border-noir-border p-6">
        <h2 className="font-serif text-xl text-white mb-6">Équipements</h2>

        <div className="flex flex-wrap gap-2 mb-5">
          {form.amenities.map((a) => (
            <div key={a} className="flex items-center gap-2 bg-noir border border-gold/30 px-3 py-1.5 text-xs text-gold">
              {a}
              <button onClick={() => removeAmenity(a)} className="text-gold/50 hover:text-red-400 transition-colors ml-1">✕</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(newAmenity))}
            placeholder="Ajouter un équipement..."
            className={inputClass + ' flex-1'}
          />
          <button onClick={() => addAmenity(newAmenity)} className="btn-gold text-xs px-5">
            Ajouter
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {AMENITIES_SUGGESTIONS.filter((s) => !form.amenities.includes(s)).map((s) => (
            <button key={s} onClick={() => addAmenity(s)}
              className="text-xs px-3 py-1.5 border border-noir-border text-gray-400 hover:border-gold hover:text-gold transition-colors">
              + {s}
            </button>
          ))}
        </div>
      </section>

      {/* iCal / Calendriers */}
      <section className="bg-noir-card border border-noir-border p-6">
        <h2 className="font-serif text-xl text-white mb-2">Synchronisation calendriers</h2>
        <p className="text-gray-500 text-xs mb-5">
          Entrez les URLs iCal de vos annonces Airbnb et Booking.com pour bloquer automatiquement les dates réservées.
          Sur Airbnb : Calendrier → Disponibilités → Exporter le calendrier. Sur Booking.com : Extranet → Calendrier → Synchroniser.
        </p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>URL iCal Airbnb</label>
            <input
              value={form.icalUrls?.airbnb || ''}
              onChange={(e) => setForm((p) => ({ ...p, icalUrls: { ...p.icalUrls, airbnb: e.target.value } }))}
              placeholder="https://www.airbnb.com/calendar/ical/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL iCal Booking.com</label>
            <input
              value={form.icalUrls?.booking || ''}
              onChange={(e) => setForm((p) => ({ ...p, icalUrls: { ...p.icalUrls, booking: e.target.value } }))}
              placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL iCal supplémentaire</label>
            <input
              value={form.icalUrls?.extra || ''}
              onChange={(e) => setForm((p) => ({ ...p, icalUrls: { ...p.icalUrls, extra: e.target.value } }))}
              placeholder="Autre plateforme..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-noir-card border border-noir-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-white">Photos</h2>
          <div className="text-xs">
            {photoStatus === 'saving' && <span className="text-gold animate-pulse">Sauvegarde...</span>}
            {photoStatus === 'saved' && <span className="text-green-400">✓ Photos sauvegardées</span>}
            {photoStatus === 'error' && <span className="text-red-400">Erreur de sauvegarde</span>}
          </div>
        </div>

        {/* Current images */}
        {form.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {form.images.map((img, i) => (
              <div key={img} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/appartements/${img}`}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 bg-noir/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => removeImage(img)}
                    className="text-red-400 text-xs border border-red-400/50 px-2 py-1 hover:bg-red-400/10 transition-colors">
                    Supprimer
                  </button>
                </div>
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-gold text-noir text-xs px-1.5 py-0.5">Photo principale</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-gold bg-gold/5' : 'border-gold/40 hover:border-gold hover:bg-gold/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-gold text-4xl mb-4">📷</div>
          <p className="text-white text-sm font-medium mb-3">
            {isDragActive ? 'Déposez ici ↓' : 'Cliquez ici pour choisir vos photos'}
          </p>
          <span className="btn-gold text-xs pointer-events-none inline-block">
            {uploading ? '⟳ Transfert en cours...' : '📁 Choisir des photos'}
          </span>
          <p className="text-gray-600 text-xs mt-4">JPG · PNG · WEBP · Max 10 Mo · Sauvegarde automatique</p>
        </div>

        {uploadError && (
          <div className="mt-4 bg-red-900/30 border border-red-500/50 p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-red-300 text-sm font-medium">Erreur d&apos;upload</p>
              <p className="text-red-400 text-xs mt-1">{uploadError}</p>
              {uploadError.includes('Session') && (
                <a href="/admin/login" className="text-gold text-xs underline mt-2 inline-block">
                  → Se reconnecter
                </a>
              )}
            </div>
            <button onClick={() => setUploadError('')} className="ml-auto text-red-400/60 hover:text-red-400 text-lg">✕</button>
          </div>
        )}
      </section>

      {/* Save button */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="btn-gold disabled:opacity-50"
        >
          {status === 'saving' ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>

        {status === 'saved' && (
          <span className="text-green-400 text-sm">✓ Modifications enregistrées</span>
        )}
        {status === 'error' && (
          <span className="text-red-400 text-sm">Erreur lors de la sauvegarde.</span>
        )}
      </div>
    </div>
  )
}
