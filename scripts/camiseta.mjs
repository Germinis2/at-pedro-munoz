// Camiseta de la tienda sin fondo: assets-src/tienda/WhatsApp Image 2026-10-31 at 10.59.14 (3).jpeg -> public/tienda/camiseta.webp
// La foto tiene detrás el estadio y un jugador, así que no vale el relleno desde los bordes de fondo.mjs:
// se queda con los píxeles rojos y blancos de la camiseta, con la mancha más grande y con sus huecos (los logos).
// Uso: node scripts/camiseta.mjs
import sharp from 'sharp'

const src = 'assets-src/tienda/WhatsApp Image 2026-10-31 at 10.59.14 (3).jpeg'
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info

// Zona del jugador que asoma abajo a la derecha (lleva la misma camiseta)
const fuera = (x, y) => x > 362 && y > 300

const shirt = new Uint8Array(w * h)
for (let p = 0; p < w * h; p++) {
  const [r, g, b] = [data[p * 4], data[p * 4 + 1], data[p * 4 + 2]]
  const red = r > 100 && r > g * 1.6 && r > b * 1.5
  const white = r > 195 && g > 190 && b > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 40
  // Rosado: la transición entre el rojo y el cuello blanco
  const pink = r > 170 && r - g > 30 && r - b > 25
  if ((red || white || pink) &&!fuera(p % w, Math.floor(p / w))) shirt[p] = 1
}

// Mancha más grande de píxeles de la camiseta
const comp = new Int32Array(w * h).fill(-1)
let best = -1
let bestSize = 0
for (let s = 0, id = 0; s < w * h; s++) {
  if (!shirt[s] || comp[s] >= 0) continue
  let size = 0
  const stack = [s]
  comp[s] = id
  while (stack.length) {
    const p = stack.pop()
    size++
    const x = p % w
    for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
      if (q >= 0 && q < w * h && shirt[q] && comp[q] < 0) {
        comp[q] = id
        stack.push(q)
      }
    }
  }
  if (size > bestSize) [best, bestSize] = [id, size]
  id++
}

// Fondo = lo que no es camiseta y se alcanza desde los bordes; el resto (logos) se queda
const bg = new Uint8Array(w * h)
const stack = []
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
while (stack.length) {
  const p = stack.pop()
  if (bg[p] || comp[p] === best) continue
  bg[p] = 1
  const x = p % w
  if (x > 0) stack.push(p - 1)
  if (x < w - 1) stack.push(p + 1)
  if (p >= w) stack.push(p - w)
  if (p < w * (h - 1)) stack.push(p + w)
}

const alpha = Buffer.alloc(w * h)
for (let p = 0; p < w * h; p++) alpha[p] = bg[p] ? 0 : 255

// Borde suavizado
const softAlpha = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer()
for (let p = 0; p < w * h; p++) data[p * 4 + 3] = softAlpha[p]

await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .trim()
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile('public/tienda/camiseta.webp')
console.log('✓ camiseta')
