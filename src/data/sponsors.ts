import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Sponsor {
  id: number
  name: string
  logo_path: string
  tier: 'principal' | 'normal'
  sort: number
  active: boolean
}

const BUCKET = 'sponsors'

export const logoUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

export async function fetchSponsors(all = false) {
  let q = supabase.from('sponsors').select('*').order('tier', { ascending: false }).order('sort').order('id')
  if (!all) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw error
  return data as Sponsor[]
}

// Una sola petición por visita aunque el pie se monte en varias páginas
let cache: Promise<Sponsor[]> | null = null
export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  useEffect(() => {
    cache ??= fetchSponsors().catch(() => [])
    cache.then(setSponsors)
  }, [])
  return sponsors
}
export const clearSponsorsCache = () => {
  cache = null
}

// Reduce el logo (máx. 600 px) y lo pasa a WebP antes de subirlo; los SVG se suben tal cual
async function shrink(file: File): Promise<{ blob: Blob; ext: string }> {
  if (file.type === 'image/svg+xml') return { blob: file, ext: 'svg' }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('No se pudo convertir'))), 'image/webp', 0.85))
  return { blob, ext: 'webp' }
}

const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('')

export async function uploadLogo(file: File) {
  const { blob, ext } = await shrink(file)
  const path = `${randomId()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000' })
  if (error) throw error
  return path
}

export async function removeLogo(path: string) {
  await supabase.storage.from(BUCKET).remove([path])
}

// "farcinox-logo_2024.jpg" -> "Farcinox logo 2024"
export const nameFromFile = (file: File) => {
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  return base.charAt(0).toUpperCase() + base.slice(1)
}
