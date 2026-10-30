// Lee un acta de la FFCM y devuelve el partido del At. Pedro Muñoz listo para revisar en el panel.
// Solo para administradores. No guarda nada: el panel enseña el resultado y el admin confirma.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { DOMParser } from 'jsr:@b-fuze/deno-dom@0.1.48'

const CLUB = 'AT. PEDRO MUÑOZ C.F.'
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

type Person = [number, string]

function parse(text: string) {
  const head = text.match(/Jornada (\d+)\s+(\d\d)-(\d\d)-(\d{4})\s+(\d\d:\d\d)?/)
  const header = text.slice(text.indexOf('(GRUPO'), text.indexOf('Árbitros'))
  const home = header.indexOf(CLUB) < header.length / 2

  const start = text.indexOf(`${CLUB} Titulares`)
  if (start < 0) throw new Error('No aparece la alineación del At. Pedro Muñoz en este acta')
  let block = text.slice(start + CLUB.length)
  const next = block.search(/\s[A-ZÁÉÍÓÚÑ."' ]{4,} Titulares/)
  if (next > 0) block = block.slice(0, next)

  const sec = (from: string, to: string[]) => {
    const i = block.indexOf(from)
    if (i < 0) return ''
    const ends = to.map((x) => block.indexOf(x, i + from.length)).filter((x) => x > 0)
    return block.slice(i + from.length, ends.length ? Math.min(...ends) : undefined).trim()
  }
  const people = (s: string): Person[] => [...s.matchAll(/(\d+) ([^\d(]+?)(?= \d+ |$)/g)].map((m) => [+m[1], m[2].trim()])
  const starters = people(sec('Titulares', ['Suplentes', 'Cuerpo']))
  const bench = people(sec('Suplentes', ['Cuerpo']))
  const names = new Set([...starters, ...bench].map(([, n]) => n))
  // A veces el acta corta el nombre ("SERNA RAMIREZ,"): se completa con la alineación
  const full = (n: string) => (names.has(n) ? n : ([...names].find((x) => x.startsWith(n)) ?? n))

  const subs = [...sec('Sustituciones', ['Tarjetas']).matchAll(/(\d+) ([^\d(]+?) (\d+) \((\d+)'\) ([^\d(]+?)(?= \d+ |$)/g)].map((m) => ({
    min: +m[4],
    in: full(m[2].trim()),
    out: full(m[5].trim()),
  }))
  const goalsText = text.slice(text.indexOf('Goles'), text.indexOf('Gol G. Penalti'))
  const allGoals = [...goalsText.matchAll(/\((\d+)'\) ([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ ,.-]+?)(?=\s{2,}|\s*$| [^A-ZÁÉÍÓÚÑÜ ,.-])/g)].map((m) => ({
    min: +m[1],
    player: full(m[2].trim()),
  }))
  const goals = allGoals.filter((g) => names.has(g.player))
  const venue = text.match(/Estadio: (.*?) Ciudad/)?.[1]?.trim() ?? null

  return {
    round: head ? +head[1] : null,
    date: head ? `${head[4]}-${head[3]}-${head[2]}` : null,
    time: head?.[5] ?? null,
    home,
    venue,
    // El marcador de la FFCM está ofuscado: se deduce de los goleadores y el admin lo revisa
    score: { us: goals.length, them: allGoals.length - goals.length },
    lineup: { starters, bench, subs, goals },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const key = Deno.env.get('SUPABASE_ANON_KEY') ?? JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}').default
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, key, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) return json({ error: 'Solo administradores' }, 403)

    const { acta } = await req.json()
    if (!Number.isInteger(acta) || acta <= 0) return json({ error: 'Número de acta no válido' }, 400)

    const res = await fetch(`https://www.ffcm.es/pnfg/NPcd/NFG_CmpPartido?cod_primaria=1000120&CodActa=${acta}&cod_acta=${acta}`)
    if (!res.ok) return json({ error: `La FFCM respondió ${res.status}` }, 502)
    const charset = /utf-8/i.test(res.headers.get('content-type') ?? '') ? 'utf-8' : 'iso-8859-1'
    const html = new TextDecoder(charset).decode(await res.arrayBuffer())
    const doc = new DOMParser().parseFromString(html, 'text/html')
    doc.querySelectorAll('script, style').forEach((n) => n.remove())
    // textContent pega las celdas de las tablas: se añade un espacio tras cada elemento
    doc.querySelectorAll('*').forEach((el) => el.appendChild(doc.createTextNode(' ')))
    const text = ((doc.querySelector('main') ?? doc.body)?.textContent ?? '').replace(/\s+/g, ' ')

    return json({ acta, ...parse(text) })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
