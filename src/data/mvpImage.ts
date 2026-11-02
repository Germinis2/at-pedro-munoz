// Imagen del MVP para Instagram (1080x1350, vertical 4:5), dibujada en el navegador con canvas
import { club } from './club'

export interface MvpImageData {
  name: string // nombre en la web, p. ej. "Reyes Pulpón"
  photo?: string // foto 3:4 del jugador
  round: number
  pct: number
  votes: number
  juvenil: boolean
  home: { name: string; crest?: string; goals: number }
  away: { name: string; crest?: string; goals: number }
}

const W = 1080
const H = 1350
const GOLD = '#f5c84c'
const RED = { 950: '#1c0207', 900: '#33050d', 800: '#520a17', 700: '#7a1022', 600: '#a3162c', 500: '#d11f3a' }
const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, ko) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // fotos de Supabase Storage: sin esto no se puede exportar el canvas
    img.onload = () => ok(img)
    img.onerror = () => ko(new Error(`No se pudo cargar ${src}`))
    img.src = src
  })
}
const tryLoad = (src?: string) => (src ? load(src).catch(() => undefined) : Promise.resolve(undefined))

// Texto en una línea que se encoge hasta caber en `max` px de ancho
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, size: number, weight = 800, italic = true) {
  let s = size
  do ctx.font = `${italic ? 'italic ' : ''}${weight} ${s}px ${FONT}`
  while (ctx.measureText(text).width > max && (s -= 4) > 20)
  ctx.fillText(text, x, y)
}

// Paralelogramo inclinado como las etiquetas de la web
function skewBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  const k = h * 0.21
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x + k, y)
  ctx.lineTo(x + w + k, y)
  ctx.lineTo(x + w - k, y + h)
  ctx.lineTo(x - k, y + h)
  ctx.closePath()
  ctx.fill()
}

function contain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, size: number) {
  const s = size / Math.max(img.width, img.height)
  ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s)
}

export async function drawMvpImage(d: MvpImageData): Promise<HTMLCanvasElement> {
  await Promise.all([
    document.fonts.load(`italic 800 100px "Barlow Condensed"`),
    document.fonts.load(`700 40px "Barlow Condensed"`),
    document.fonts.load(`600 40px "Barlow Condensed"`),
  ]).catch(() => {})
  const [photo, crest, homeCrest, awayCrest] = await Promise.all([tryLoad(d.photo), tryLoad(club.crest), tryLoad(d.home.crest), tryLoad(d.away.crest)])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // Fondo: degradado granate, franja diagonal oscura y rayas como la cabecera de la portada
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0, RED[600])
  bg.addColorStop(0.55, RED[800])
  bg.addColorStop(1, RED[950])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.10)'
  for (let x = -H; x < W + H; x += 92) {
    ctx.beginPath()
    ctx.moveTo(x, H)
    ctx.lineTo(x + 46, H)
    ctx.lineTo(x + 46 + H * 0.47, 0)
    ctx.lineTo(x + H * 0.47, 0)
    ctx.fill()
  }
  ctx.restore()
  // "MVP" gigante de fondo
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#fff'
  ctx.font = `italic 800 520px ${FONT}`
  ctx.fillText('MVP', W / 2, 760)
  ctx.restore()

  // Cabecera: escudo y nombre del club
  if (crest) contain(ctx, crest, 120, 118, 120)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#fff'
  ctx.font = `italic 800 54px ${FONT}`
  ctx.fillText(club.name.toUpperCase(), 200, 116)
  ctx.fillStyle = '#f08a9a'
  ctx.font = `700 28px ${FONT}`
  ctx.letterSpacing = '5px'
  ctx.fillText(d.juvenil ? 'JUVENIL · TEMPORADA ' + club.season : 'PRIMER EQUIPO · TEMPORADA ' + club.season, 202, 158)
  ctx.letterSpacing = '0px'
  ctx.textAlign = 'center'

  // Foto en círculo con aro dorado
  const cx = W / 2, cy = 560, r = 300
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 60
  ctx.beginPath()
  ctx.arc(cx, cy, r + 14, 0, Math.PI * 2)
  ctx.fillStyle = GOLD
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = RED[700]
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  if (photo) {
    // La foto es 3:4: algo más ancha que el círculo y alineada por arriba para que se vean bien la cara y el pecho
    const w = r * 2 * 1.2
    const h = (photo.height / photo.width) * w
    ctx.drawImage(photo, cx - w / 2, cy - r - 10, w, h)
  } else if (crest) {
    contain(ctx, crest, cx, cy, r * 1.3)
  }
  ctx.restore()

  // Etiqueta dorada "MVP · JORNADA X"
  const label = `MVP · JORNADA ${d.round}`
  ctx.font = `italic 800 52px ${FONT}`
  const lw = ctx.measureText(label).width + 70
  skewBox(ctx, cx - lw / 2, 892, lw, 74, GOLD)
  ctx.fillStyle = RED[950]
  ctx.fillText(label, cx, 948)

  // Nombre
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 20
  fitText(ctx, d.name.toUpperCase(), cx, 1080, W - 120, 140)
  ctx.shadowBlur = 0

  // Votos
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `600 40px ${FONT}`
  ctx.fillText(`${d.pct}% de ${d.votes} ${d.votes === 1 ? 'voto' : 'votos'}`, cx, 1140)

  // Pie: resultado del partido
  const by = 1196, bh = 110
  ctx.fillStyle = 'rgba(28,2,7,0.75)'
  ctx.fillRect(0, by, W, bh)
  ctx.fillStyle = RED[500]
  ctx.fillRect(0, by, W, 6)
  const score = `${d.home.goals} - ${d.away.goals}`
  ctx.font = `italic 800 70px ${FONT}`
  ctx.fillStyle = '#fff'
  ctx.fillText(score, cx, by + 82)
  const half = ctx.measureText(score).width / 2 + 40
  for (const [side, t, logo] of [[-1, d.home, homeCrest], [1, d.away, awayCrest]] as const) {
    ctx.textAlign = side < 0 ? 'right' : 'left'
    const tx = cx + side * (half + 70)
    if (logo) contain(ctx, logo, cx + side * (half + 30), by + 58, 60)
    ctx.fillStyle = '#fff'
    let s = 38
    do ctx.font = `700 ${s}px ${FONT}`
    while (ctx.measureText(t.name.toUpperCase()).width > W / 2 - half - 110 && (s -= 2) > 18)
    ctx.fillText(t.name.toUpperCase(), tx, by + 70)
  }
  ctx.textAlign = 'center'

  // Usuario de Instagram del club
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `700 28px ${FONT}`
  ctx.letterSpacing = '4px'
  const ig = club.social.instagram.match(/instagram\.com\/([^/]+)/)?.[1]
  ctx.fillText(ig ? `@${ig.toUpperCase()}` : club.name.toUpperCase(), cx, 1342 - 8)
  ctx.letterSpacing = '0px'

  return canvas
}

export async function mvpImageBlob(d: MvpImageData) {
  const canvas = await drawMvpImage(d)
  return new Promise<Blob>((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('No se pudo crear la imagen'))), 'image/jpeg', 0.92))
}

// En el móvil abre el menú de compartir (para mandarla directa a Instagram); si no, la descarga
export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      return await navigator.share({ files: [file] })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}
