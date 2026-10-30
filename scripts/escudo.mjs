// Quita el fondo blanco del escudo (relleno desde los bordes) y genera los tamaños web.
// Uso: node scripts/escudo.mjs assets-src/escudo-original.jpg
import sharp from 'sharp'

const src = process.argv[2] ?? 'assets-src/escudo-original.jpg'
// La imagen original trae un marco gris fino: se recorta un pequeño margen antes de procesar
const meta = await sharp(src).metadata()
const inset = Math.round(Math.min(meta.width, meta.height) * 0.02)
const { data, info } = await sharp(src)
  .extract({ left: inset, top: inset, width: meta.width - inset * 2, height: meta.height - inset * 2 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info

const isBg = (i) => data[i] > 205 && data[i + 1] > 205 && data[i + 2] > 205
const seen = new Uint8Array(w * h)
const stack = []
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)

while (stack.length) {
  const p = stack.pop()
  if (seen[p]) continue
  seen[p] = 1
  if (!isBg(p * 4)) continue
  data[p * 4 + 3] = 0
  const x = p % w
  if (x > 0) stack.push(p - 1)
  if (x < w - 1) stack.push(p + 1)
  if (p >= w) stack.push(p - w)
  if (p < w * (h - 1)) stack.push(p + w)
}

const clean = sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim()
const buf = await clean.png().toBuffer()
await sharp(buf).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile('public/escudo.webp')
await sharp(buf).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/escudo.png')
await sharp(buf).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/favicon.png')
console.log('escudo listo', w, h)
