import { supabase } from '../lib/supabase'

// Clave pública VAPID (la privada solo está en los secretos de la función "avisos" de Supabase)
const VAPID_PUBLIC_KEY = 'BPzQsgvdYTVtc4s9yHGhGak5BrtzP2VffBdn54wZBh-oq2Pa9jEz3bNvgQUltg3NxGzAJa-EBIW7wD7S6w8AJHs'

type TeamId = 'primer' | 'juvenil'
export type PushSupport = 'ok' | 'ios-install' | 'insecure' | 'unsupported'

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const standalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

export function pushSupport(): PushSupport {
  if (!window.isSecureContext) return 'insecure'
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) return 'ok'
  // En iPhone los avisos solo funcionan con la web añadida a la pantalla de inicio
  if (isIos() && !standalone()) return 'ios-install'
  return 'unsupported'
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => {})
}

// Equipos con avisos activados en este dispositivo (solo para pintar el botón; la lista real está en Supabase)
const KEY = 'avisos'
export function subscribedTeams(): TeamId[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
function saveTeams(teams: TeamId[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(teams))
  } catch {
    // sin almacenamiento: el botón no recordará el estado, pero los avisos siguen activos
  }
}

const toBytes = (b64: string) => Uint8Array.from(atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

export async function enablePush(team: TeamId) {
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('denied')
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(VAPID_PUBLIC_KEY) }))
  const { keys } = sub.toJSON() as { keys: { p256dh: string; auth: string } }
  const { error } = await supabase.rpc('push_subscribe', { p_endpoint: sub.endpoint, p_p256dh: keys.p256dh, p_auth: keys.auth, p_team: team })
  if (error) throw error
  saveTeams([...new Set([...subscribedTeams(), team])])
}

export async function disablePush(team: TeamId) {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) await supabase.rpc('push_unsubscribe', { p_endpoint: sub.endpoint, p_team: team })
  const rest = subscribedTeams().filter((t) => t !== team)
  saveTeams(rest)
  if (sub && !rest.length) await sub.unsubscribe()
}

// Desde el panel: pide a la función "avisos" que avise (solo envía una vez por votación o partido)
export async function notify(kind: 'mvp' | 'result', ref: number) {
  const { data, error } = await supabase.functions.invoke('avisos', { body: { kind, ref } })
  if (error) console.error('avisos', error)
  return data as { sent?: number; reason?: string } | null
}
