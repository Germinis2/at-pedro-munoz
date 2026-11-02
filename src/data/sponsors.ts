import { useEffect, useState } from 'react'
import { uploadImage } from '../lib/images'
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

// Logos de máx. 600 px en WebP
export const uploadLogo = (file: File) => uploadImage(BUCKET, file, 600)

export async function removeLogo(path: string) {
  await supabase.storage.from(BUCKET).remove([path])
}

// "farcinox-logo_2024.jpg" -> "Farcinox logo 2024"
export const nameFromFile = (file: File) => {
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  return base.charAt(0).toUpperCase() + base.slice(1)
}
