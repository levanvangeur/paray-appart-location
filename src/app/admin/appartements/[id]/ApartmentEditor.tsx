'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Apartment } from '@/lib/types'

interface Props {
  apartment: Apartment
}

const AMENITIES_SUGGESTIONS = [
  'WiFi haut débit', 'Cuisine équipée', 'Parking privé', 'Parking', 'Linge de maison',
  'TV écran plat', 'Lave-linge', 'Lave-vaisselle', 'Climatisation', 'Terrasse', 'Balcon',
  'Jacuzzi', 'Lit bébé disponible', 'Chargeur voiture électrique', 'Coffre-fort',
]

export default function ApartmentEditor({ apartment }: Props) {
  const [form, setForm] = useState<Apartment>({ ...apartment })
  const [newAmenity, setNewAmenity] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

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

  const removeImage = (filename: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== filename) }))
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadError('')

    for (const file of acceptedFiles) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('apartmentId', apartment.id)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (res.ok) {
        setForm((prev) => ({ ...prev, images: [...prev.images, data.filename] }))
      } else {
        setUploadError(data.error || 'Erreur upload')
      }
    }

    setUploading(false)
  }, [apartment.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
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

      {/* Images */}
      <section className="bg-noir-card border border-noir-border p-6">
        <h2 className="font-serif text-xl text-white mb-6">Photos</h2>

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
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-gold bg-gold/5' : 'border-noir-border hover:border-gold/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-gold text-3xl mb-3">↑</div>
          <p className="text-gray-400 text-sm mb-1">
            {isDragActive ? 'Déposez les photos ici...' : 'Glissez vos photos ici, ou cliquez pour sélectionner'}
          </p>
          <p className="text-gray-600 text-xs">JPG, PNG, WEBP · Max 10 Mo par fichier</p>
          {uploading && <p className="text-gold text-xs mt-3">Téléchargement en cours...</p>}
          {uploadError && <p className="text-red-400 text-xs mt-3">{uploadError}</p>}
        </div>
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
