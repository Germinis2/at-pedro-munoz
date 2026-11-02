import { imageUrl, randomId } from '../lib/images'
import { supabase } from '../lib/supabase'
import type { PlayerRow } from './types'

// Fotos procesadas por scripts/fotos.mjs: src/assets/fotos/<equipo>/<id-jugador>.webp
const files = import.meta.glob('../assets/fotos/*/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export const bundledPhoto = (team: string, id: string): string | undefined => files[`../assets/fotos/${team}/${id}.webp`]

// La subida desde el panel manda sobre la incluida en la web; 'none' la quita
export function photoFor(row: Pick<PlayerRow, 'team_id' | 'id' | 'photo'>): string | undefined {
  if (row.photo === 'none') return undefined
  if (row.photo) return imageUrl(BUCKET, row.photo)
  return bundledPhoto(row.team_id, row.id)
}

const BUCKET = 'players'
// Misma zona que scripts/fotos.mjs: en la plantilla horizontal del club el jugador está a la derecha
const CROP = { left: 0.545, width: 0.42 }

// Recorta a 3:4 (480x640) en el navegador: plantilla del club si es horizontal; si no, centrada y desde arriba
async function cropPortrait(file: File) {
  const img = await createImageBitmap(file)
  let sx = 0, sw = img.width, sh = img.height
  if (img.width > img.height) {
    sx = Math.round(img.width * CROP.left)
    sw = Math.round(img.width * CROP.width)
    sh = Math.min(img.height, Math.round((sw * 4) / 3))
  } else if (img.width / img.height > 3 / 4) {
    sw = Math.round((img.height * 3) / 4)
    sx = Math.round((img.width - sw) / 2)
  } else {
    sh = Math.round((img.width * 4) / 3)
  }
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 640
  canvas.getContext('2d')!.drawImage(img, sx, 0, sw, sh, 0, 0, 480, 640)
  return new Promise<Blob>((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('No se pudo convertir la foto'))), 'image/webp', 0.85))
}

export async function uploadPlayerPhoto(file: File) {
  const path = `${randomId()}.webp`
  const { error } = await supabase.storage.from(BUCKET).upload(path, await cropPortrait(file), { contentType: 'image/webp', cacheControl: '31536000' })
  if (error) throw error
  return path
}

export async function removePlayerPhoto(photo: string | null | undefined) {
  if (photo && photo !== 'none') await supabase.storage.from(BUCKET).remove([photo])
}
