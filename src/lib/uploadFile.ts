/**
 * Envoie un fichier image au serveur via JSON/base64
 * Plus fiable que FormData/multipart dans tous les contextes
 */
export async function uploadFile(
  file: File,
  type: 'hero' | 'appartement',
  apartmentId?: string
): Promise<{ filename: string } | { error: string }> {
  // Lire le fichier comme data URL (base64)
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Retirer le préfixe "data:image/jpeg;base64,"
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('Impossible de lire le fichier'))
    reader.readAsDataURL(file)
  })

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      type,
      apartmentId,
      data: base64,
    }),
  })

  return res.json()
}
