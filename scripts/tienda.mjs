// Imágenes de la tienda: assets-src/tienda/* -> public/tienda/<nombre>.webp
// Uso: node scripts/tienda.mjs
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const dir = 'assets-src/tienda'
const items = [
  ['WhatsApp Image 2026-10-31 at 10.59.14 (1).jpeg', 'bandera-espana-escudos'],
  ['WhatsApp Image 2026-10-31 at 10.59.14 (2).jpeg', 'bandera-espana'],
  ['WhatsApp Image 2026-10-31 at 10.59.14 (4).jpeg', 'bandera-rojiblanca-escudos'],
  ['WhatsApp Image 2026-10-31 at 10.59.14.jpeg', 'bandera-rojiblanca'],
  ['WhatsApp Image 2026-10-31 at 10.59.14 (3).jpeg', 'camiseta'],
  // Captura de Instagram: solo la bufanda, sin el texto superpuesto de abajo
  ['Captura de pantalla 2026-11-02 094946.png', 'bufanda', { left: 125, top: 32, width: 530, height: 703 }],
]

await mkdir('public/tienda', { recursive: true })
for (const [file, name, crop] of items) {
  let img = sharp(`${dir}/${file}`)
  if (crop) img = img.extract(crop)
  await img.resize(900, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(`public/tienda/${name}.webp`)
  console.log('✓', name)
}
