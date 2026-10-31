import sharp from 'sharp'

// Devuelve un PNG con el fondo eliminado (relleno desde los bordes) y recortado.
// - modo 'blanco': quita los píxeles casi blancos conectados al borde.
// - modo 'vecinos': sigue cualquier fondo (colores, degradados) mientras el color cambie poco entre
//   píxeles vecinos; se detiene en los contornos del escudo.
// `inset` recorta antes un margen en píxeles; `extract` recorta una zona concreta.
export async function quitarFondo(src, { inset = 0, umbral = 205, modo = 'blanco', tolerancia = 18, extract } = {}) {
  let img = sharp(src)
  const meta = await img.metadata()
  const zona = extract ?? { left: inset, top: inset, width: meta.width - inset * 2, height: meta.height - inset * 2 }
  const { data, info } = await img.extract(zona).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  const isWhite = (i) => data[i] > umbral && data[i + 1] > umbral && data[i + 2] > umbral
  const near = (i, j) =>
    Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]) <= tolerancia * 3

  const seen = new Uint8Array(w * h)
  const stack = [] // pares [píxel, píxel del que venimos]
  for (let x = 0; x < w; x++) stack.push(x, x, (h - 1) * w + x, (h - 1) * w + x)
  for (let y = 0; y < h; y++) stack.push(y * w, y * w, y * w + w - 1, y * w + w - 1)

  while (stack.length) {
    const from = stack.pop()
    const p = stack.pop()
    if (seen[p]) continue
    const ok = modo === 'blanco' ? isWhite(p * 4) : near(p * 4, from * 4)
    if (!ok) continue
    seen[p] = 1
    data[p * 4 + 3] = 0
    const x = p % w
    if (x > 0) stack.push(p - 1, p)
    if (x < w - 1) stack.push(p + 1, p)
    if (p >= w) stack.push(p - w, p)
    if (p < w * (h - 1)) stack.push(p + w, p)
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim().png().toBuffer()
}

export const transparente = { r: 0, g: 0, b: 0, alpha: 0 }
