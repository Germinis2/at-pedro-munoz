// Escudos de los rivales: assets-src/escudos/* -> public/escudos/<nombre>.webp
// Los que no traen transparencia (p. ej. JPG) se pasan por quitarFondo.
// Los archivos que empiezan por "_" se ignoran (pendientes de revisar).
// Uso: node scripts/escudos.mjs
import { mkdir, readdir } from 'node:fs/promises'
import { parse } from 'node:path'
import sharp from 'sharp'
import { quitarFondo, transparente } from './fondo.mjs'

// Ajustes por escudo cuando la imagen no es solo el escudo
const ajustes = {
  // Captura de una web de escudos: solo la zona del escudo, sobre degradado naranja
  herencia: { modo: 'vecinos', extract: { left: 115, top: 40, width: 260, height: 375 } },
}

const dir = 'assets-src/escudos'
await mkdir('public/escudos', { recursive: true })

for (const file of await readdir(dir)) {
  if (file.startsWith('_')) continue
  const src = `${dir}/${file}`
  const name = parse(file).name
  const { hasAlpha } = await sharp(src).metadata()
  const input = ajustes[name]
    ? await quitarFondo(src, ajustes[name])
    : hasAlpha
      ? await sharp(src).trim().png().toBuffer()
      : await quitarFondo(src)
  await sharp(input)
    .resize(120, 120, { fit: 'contain', background: transparente, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(`public/escudos/${name}.webp`)
  console.log('✓', file)
}
