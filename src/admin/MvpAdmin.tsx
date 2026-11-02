import { useCallback, useEffect, useState } from 'react'
import { fetchResults } from '../data/mvp'
import { notify } from '../data/push'
import { useTeams } from '../data/teams'
import type { MatchRow, MvpPoll } from '../data/types'
import { supabase } from '../lib/supabase'
import { Button, Notice } from './ui'

export function MvpAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { teams, reload } = useTeams()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [polls, setPolls] = useState<MvpPoll[]>([])
  const [results, setResults] = useState<Record<number, { player_id: string; votes: number }[]>>({})
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const m = await supabase.from('matches').select('*').eq('team_id', team).not('score_us', 'is', null).order('date', { ascending: false })
    const ms = (m.data as MatchRow[]) ?? []
    const p = await supabase.from('mvp_polls').select('*').in('match_id', ms.map((x) => x.id!))
    const ps = (p.data as MvpPoll[]) ?? []
    setMatches(ms)
    setPolls(ps)
    const entries = await Promise.all(ps.map(async (poll) => [poll.id, await fetchResults(poll.id)] as const))
    setResults(Object.fromEntries(entries))
  }, [team])
  useEffect(() => {
    load()
  }, [load])

  const run = async (q: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await q
    setError(error?.message ?? '')
    load()
    reload()
  }
  // Abre la votación y avisa a quien tenga los avisos activados
  const openVote = async (matchId: number) => {
    const { data, error } = await supabase.from('mvp_polls').insert({ match_id: matchId }).select('id').single()
    if (!error) await notify('mvp', data.id)
    run(Promise.resolve({ error }))
  }
  const players = teams[team].players
  const name = (id: string) => {
    const p = players.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }
  const openPoll = polls.find((p) => p.status === 'open')

  return (
    <div className="space-y-3">
      <Notice>
        Abre la votación de un partido jugado: en la portada aparecerán los jugadores que jugaron. Al cerrarla, la portada muestra al ganador.
        {openPoll && ' Solo conviene tener una votación abierta a la vez.'}
      </Notice>
      {error && <Notice kind="error">{error}</Notice>}
      {matches.map((m) => {
        const poll = polls.find((p) => p.match_id === m.id)
        const res = poll ? (results[poll.id] ?? []) : []
        const total = res.reduce((a, r) => a + r.votes, 0)
        return (
          <div key={m.id} className="panel space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-auto text-sm font-semibold">
                J{m.round} · {m.home ? 'vs' : 'en'} {m.opponent} <span className="text-white/50">({m.score_us}-{m.score_them})</span>
              </p>
              {!m.lineup && <span className="text-xs text-white/50">Sin alineación: importa el acta primero</span>}
              {m.lineup && !poll && <Button onClick={() => openVote(m.id!)}>Abrir votación</Button>}
              {poll?.status === 'open' && (
                <Button variant="danger" onClick={() => run(supabase.from('mvp_polls').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', poll.id))}>
                  Cerrar votación
                </Button>
              )}
              {poll?.status === 'closed' && (
                <Button variant="ghost" onClick={() => run(supabase.from('mvp_polls').update({ status: 'open', closed_at: null }).eq('id', poll.id))}>
                  Reabrir
                </Button>
              )}
            </div>
            {poll && (
              <div className="text-sm">
                <p className="mb-1 text-xs text-white/50">{poll.status === 'open' ? 'Abierta' : 'Cerrada'} · {total} votos</p>
                <ol className="space-y-0.5">
                  {res.slice(0, 5).map((r, i) => (
                    <li key={r.player_id} className="flex justify-between">
                      <span>{i + 1}. {name(r.player_id)}</span>
                      <span className="tabular-nums text-white/70">{r.votes} ({Math.round((r.votes / total) * 100)}%)</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
