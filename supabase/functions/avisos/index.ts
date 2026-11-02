// Envía los avisos push: votación del MVP abierta o resultado final de un partido.
// La llama el panel ({ kind: 'mvp', ref: id de la votación } o { kind: 'result', ref: id del partido })
// con la sesión del administrador. Cada aviso se envía una sola vez (tabla push_sent).
// Secretos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT (npx supabase secrets set ...).
import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import webpush from 'npm:web-push@3.6.7'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const CLUB = 'At. Pedro Muñoz'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = Deno.env.get('SUPABASE_URL')!
  // ¿Quien llama es administrador? Se comprueba con su propia sesión
  const asUser = createClient(url, req.headers.get('apikey') ?? Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: isAdmin } = await asUser.rpc('is_admin')
  if (!isAdmin) return json({ error: 'Solo administradores' }, 403)

  const { kind, ref } = await req.json()
  if (!['mvp', 'result'].includes(kind) || !Number.isInteger(ref)) return json({ error: 'Petición no válida' }, 400)

  // Clave interna del proyecto (la pone Supabase en las funciones): lee suscripciones y avisos enviados
  const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const matchId = kind === 'mvp'
    ? (await db.from('mvp_polls').select('match_id, status').eq('id', ref).single()).data?.match_id
    : ref
  const { data: m } = await db.from('matches').select('*').eq('id', matchId).single()
  if (!m) return json({ error: 'Partido no encontrado' }, 404)
  if (kind === 'result' && m.score_us == null) {
    return json({ sent: 0, reason: 'Sin resultado final' })
  }

  // Solo una vez por votación o partido
  const { error: dup } = await db.from('push_sent').insert({ kind, ref })
  if (dup) return json({ sent: 0, reason: 'Ya avisado' })

  const juvenil = m.team_id === 'juvenil'
  const us = juvenil ? `${CLUB} Juvenil` : CLUB
  const base = juvenil ? '/juvenil' : ''
  const [home, away] = m.home ? [us, m.opponent] : [m.opponent, us]
  const payload = kind === 'mvp'
    ? {
        title: '🗳️ ¡Vota al MVP!',
        body: `Ya está abierta la votación del ${home} - ${away} (jornada ${m.round}). Elige al mejor del partido.`,
        url: `${base}/partido/${m.id}`,
        tag: `mvp-${ref}`,
      }
    : {
        title: `Final: ${home} ${m.home ? m.score_us : m.score_them}-${m.home ? m.score_them : m.score_us} ${away}`,
        body: `Jornada ${m.round}. Mira los goles, los cambios y las alineaciones.`,
        url: `${base}/partido/${m.id}`,
        tag: `result-${ref}`,
      }

  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)
  const { data: subs } = await db.from('push_subscriptions').select('*').contains('teams', [m.team_id])

  let sent = 0
  const gone: string[] = []
  await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 24 })
      sent++
    } catch (e) {
      // 404/410: el navegador anuló la suscripción
      const code = (e as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) gone.push(s.endpoint)
      else console.error('push', code, (e as Error).message)
    }
  }))
  if (gone.length) await db.from('push_subscriptions').delete().in('endpoint', gone)

  return json({ sent, total: subs?.length ?? 0 })
})
