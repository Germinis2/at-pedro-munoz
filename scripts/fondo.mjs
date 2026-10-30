import sharp from 'sharp'

// Devuelve un PNG con el fondo blanco eliminado (relleno desde los bordes) y recortado.
// `inset` recorta antes un margen en píxeles (para marcos finos de capturas).
export async function quitarFondo(src, { inset = 0, umbral = 205 } = {}) {
  const meta = await sharp(src).metadata()
  const { data, info } = await sharp(src)
    .extract({ left: inset, top: inset, width: meta.width - inset * 2, height: meta.height - inset * 2 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  const isBg = (i) => data[i] > umbral && data[i + 1] > umbral && data[i + 2] > umbral
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

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim().png().toBuffer()
}

export const transparente = { r: 0, g: 0, b: 0, alpha: 0 }
