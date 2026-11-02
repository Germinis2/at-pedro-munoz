// Foto del estadio para el pie: assets-src/Estadio_municipal_Juan_de_Ramos_pm.jpg -> public/estadio.webp
// Uso: node scripts/estadio.mjs
import sharp from 'sharp'

await sharp('assets-src/Estadio_municipal_Juan_de_Ramos_pm.jpg')
  // Quita parte del cielo y del camino para centrar la tribuna
  .extract({ left: 0, top: 380, width: 3472, height: 1950 })
  .resize(900)
  .webp({ quality: 78 })
  .toFile('public/estadio.webp')
console.log('✓ estadio')
