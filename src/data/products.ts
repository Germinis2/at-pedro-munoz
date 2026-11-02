import { imageUrl, uploadImage } from '../lib/images'
import { supabase } from '../lib/supabase'
import { club } from './club'

export interface ProductImage {
  path: string
  label: string // modelo (p. ej. "Rojiblanca · escudo del club")
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number | null // null = consultar precio
  images: ProductImage[]
  sort: number
  active: boolean
}

const BUCKET = 'shop'

export const productImageUrl = (path: string) => imageUrl(BUCKET, path)
export const uploadProductImage = (file: File) => uploadImage(BUCKET, file, 1000)
export const removeProductImage = async (path: string) => {
  if (!path.startsWith('/')) await supabase.storage.from(BUCKET).remove([path])
}

export async function fetchProducts(all = false) {
  let q = supabase.from('products').select('*').order('sort').order('id')
  if (!all) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw error
  return (data as Product[]).map((p) => ({ ...p, price: p.price == null ? null : Number(p.price) }))
}

export const fmtPrice = (p: number | null) =>
  p == null ? 'Consultar precio' : `${p.toLocaleString('es-ES', { minimumFractionDigits: p % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`

// Enlace a WhatsApp con el mensaje ya escrito
export const whatsappUrl = (text: string) => `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(text)}`

// Neutro a propósito: vale para cualquier artículo que se añada desde el panel
export const orderText = (p: Product, model?: string) =>
  `¡Hola! Me interesa este artículo de la tienda del ${club.shortName}: ${p.name}` +
  `${model && p.images.length > 1 ? ` (modelo: ${model})` : ''}. ¿Está disponible?`
