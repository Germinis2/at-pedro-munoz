// Escudo del club: quita el fondo blanco y genera los tamaños web.
// Uso: node scripts/escudo.mjs assets-src/escudo-original.jpg
import sharp from 'sharp'
import { quitarFondo, transparente } from './fondo.mjs'

const src = process.argv[2] ?? 'assets-src/escudo-original.jpg'
const meta = await sharp(src).metadata()
// La imagen original trae un marco gris fino: se recorta un pequeño margen antes de procesar
const buf = await quitarFondo(src, { inset: Math.round(Math.min(meta.width, meta.height) * 0.02) })

const square = (size) => sharp(buf).resize(size, size, { fit: 'contain', background: transparente })
await square(512).webp({ quality: 90 }).toFile('public/escudo.webp')
await square(512).png().toFile('public/escudo.png')
await square(192).png().toFile('public/favicon.png')
console.log('escudo listo')
