// Iconos de la web instalada y de los avisos: escudo sobre el granate del club
// Uso: node scripts/iconos.mjs
import sharp from 'sharp'

const bg = '#3b0710'
for (const size of [192, 512]) {
  const crest = await sharp('public/escudo.png').resize(Math.round(size * 0.66), Math.round(size * 0.66), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: crest, gravity: 'center' }])
    .png()
    .toFile(`public/icon-${size}.png`)
}
// Icono pequeño de la barra de estado de Android: silueta blanca del escudo
const alpha = await sharp('public/escudo.png').resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().extractChannel(3).toBuffer()
await sharp({ create: { width: 96, height: 96, channels: 3, background: '#ffffff' } }).joinChannel(alpha).png().toFile('public/badge.png')
// Icono de iPhone al añadir a la pantalla de inicio
await sharp('public/icon-192.png').resize(180).toFile('public/apple-touch-icon.png')
console.log('✓ iconos')
