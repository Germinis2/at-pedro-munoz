// Fotos de jugadores: assets-src/fotos/<equipo>/<id-jugador>.<ext> -> src/assets/fotos/<equipo>/<id-jugador>.webp
// Las fotos del club vienen en plantilla horizontal (escudo a la izquierda, jugador a la derecha):
// se recorta la zona del jugador en formato 3:4.
// Uso: node scripts/fotos.mjs
import { mkdir, readdir } from 'node:fs/promises'
import { parse } from 'node:path'
import sharp from 'sharp'

// Zona del jugador en proporción al tamaño de la imagen. Termina por encima de la línea
// del nombre (abajo, ~87% del alto), que en nombres largos invade la zona del jugador.
const CROP = { left: 0.545, top: 0, width: 0.42 }

for (const team of await readdir('assets-src/fotos')) {
  const out = `src/assets/fotos/${team}`
  await mkdir(out, { recursive: true })
  for (const file of await readdir(`assets-src/fotos/${team}`)) {
    const src = `assets-src/fotos/${team}/${file}`
    const { width, height } = await sharp(src).metadata()
    const w = Math.round(width * CROP.width)
    const h = Math.min(Math.round((w * 4) / 3), height - Math.round(height * CROP.top))
    await sharp(src)
      .extract({ left: Math.round(width * CROP.left), top: Math.round(height * CROP.top), width: w, height: h })
      .resize(480, 640, { fit: 'cover', position: 'top' })
      .webp({ quality: 82 })
      .toFile(`${out}/${parse(file).name}.webp`)
    console.log('✓', team, file)
  }
}
