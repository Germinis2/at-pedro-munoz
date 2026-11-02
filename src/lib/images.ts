import { supabase } from './supabase'

// Reduce la imagen (lado mayor `max` px) y la pasa a WebP en el navegador antes de subirla; los SVG van tal cual
export async function shrinkImage(file: File, max: number): Promise<{ blob: Blob; ext: string }> {
  if (file.type === 'image/svg+xml') return { blob: file, ext: 'svg' }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('No se pudo convertir'))), 'image/webp', 0.85))
  return { blob, ext: 'webp' }
}

export const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('')

// Sube una imagen reducida a un bucket público y devuelve su ruta
export async function uploadImage(bucket: string, file: File, max: number) {
  const { blob, ext } = await shrinkImage(file, max)
  const path = `${randomId()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000' })
  if (error) throw error
  return path
}

// Ruta pública de la web ("/tienda/x.webp") o archivo de Storage
export const imageUrl = (bucket: string, path: string) =>
  path.startsWith('/') ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
