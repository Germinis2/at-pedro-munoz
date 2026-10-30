// Escudos de los rivales: assets-src/escudos/* -> public/escudos/<nombre>.webp
// Los que no traen transparencia (p. ej. JPG) se pasan por quitarFondo.
// Uso: node scripts/escudos.mjs
import { mkdir, readdir } from 'node:fs/promises'
import { parse } from 'node:path'
import sharp from 'sharp'
import { quitarFondo, transparente } from './fondo.mjs'

const dir = 'assets-src/escudos'
await mkdir('public/escudos', { recursive: true })

for (const file of await readdir(dir)) {
  const src = `${dir}/${file}`
  const { hasAlpha } = await sharp(src).metadata()
  const input = hasAlpha ? await sharp(src).trim().png().toBuffer() : await quitarFondo(src)
  await sharp(input)
    .resize(120, 120, { fit: 'contain', background: transparente, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(`public/escudos/${parse(file).name}.webp`)
  console.log('✓', file)
}
