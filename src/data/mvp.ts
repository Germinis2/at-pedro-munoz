import { supabase } from '../lib/supabase'
import type { Match, Player } from './types'

// Candidatos: los que jugaron el partido (titulares y los que entraron)
export function candidates(match: Match, players: Player[]) {
  const l = match.lineup
  if (!l) return []
  const played = new Set([...l.starters.map(([, n]) => n), ...l.subs.map((s) => s.in)])
  return players.filter((p) => played.has(p.ffcm))
}

export async function fetchResults(poll: number) {
  const { data, error } = await supabase.rpc('mvp_results', { p_poll: poll })
  if (error) throw error
  return (data as { player_id: string; votes: number }[]).map((r) => ({ ...r, votes: Number(r.votes) }))
}

// 32 caracteres hexadecimales aleatorios. crypto.randomUUID solo existe en páginas https/localhost;
// getRandomValues funciona también en http (p. ej. al probar desde el móvil por la red local)
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')

// Identificador anónimo del dispositivo (un voto por votación y dispositivo)
function deviceId() {
  const key = 'apm-voter'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = randomId()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return randomId()
  }
}

const votedKey = (poll: number) => `apm-voted-${poll}`
export const votedFor = (poll: number) => {
  try {
    return localStorage.getItem(votedKey(poll))
  } catch {
    return null
  }
}

export async function vote(poll: number, player: string) {
  const { error } = await supabase.rpc('vote_mvp', { p_poll: poll, p_player: player, p_voter: deviceId() })
  if (error && !error.message.includes('Ya has votado')) throw error
  try {
    localStorage.setItem(votedKey(poll), player)
  } catch {
    /* sin almacenamiento: solo se pierde el recordatorio local */
  }
}
