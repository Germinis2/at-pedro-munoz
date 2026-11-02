import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { candidates, fetchResults, fmtCloses, isOpen, vote, votedFor } from '../data/mvp'
import { useTeam } from '../data/teams'
import type { MvpPoll } from '../data/types'
import { PlayerImage } from './PlayerImage'

type Results = { player_id: string; votes: number }[]

// Sin `matchId`: la votación de la portada. Con `matchId`: solo la de ese partido (en su página)
export function MvpCard({ matchId }: { matchId?: number }) {
  const team = useTeam()
  const [poll, setPoll] = useState<MvpPoll | null>(null)
  const [results, setResults] = useState<Results | null>(null)
  const [voted, setVoted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const match = poll && team.matches.find((m) => m.id === poll.match_id)

  // Primero una votación abierta; si no hay, el ganador de la cerrada del partido más reciente que tenga votos
  useEffect(() => {
    let cancelled = false
    const dateOf = (p: MvpPoll) => team.matches.find((m) => m.id === p.match_id)?.date ?? ''
    const polls = matchId === undefined ? team.polls : team.polls.filter((p) => p.match_id === matchId)
    const open = polls.filter((p) => isOpen(p))
    const closed = polls.filter((p) => !isOpen(p)).sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
    ;(async () => {
      for (const p of [...open, ...closed]) {
        const r = await fetchResults(p.id).catch(() => [])
        if (isOpen(p) || r.length) {
          if (cancelled) return
          setPoll(p)
          setResults(r)
          setVoted(votedFor(p.id))
          return
        }
      }
      if (!cancelled) setPoll(null)
    })()
    return () => {
      cancelled = true
    }
  }, [team, matchId])

  if (!poll || !match) return null
  const list = candidates(match, team.players)
  const total = results?.reduce((a, r) => a + r.votes, 0) ?? 0
  const byId = (id: string) => team.players.find((p) => p.id === id)
  const pct = (id: string) => (total ? Math.round(((results?.find((r) => r.player_id === id)?.votes ?? 0) / total) * 100) : 0)
  const open = isOpen(poll)
  const showResults = !open || !!voted

  const submit = async (id: string) => {
    setBusy(true)
    setError('')
    try {
      await vote(poll.id, id)
      setVoted(id)
      setResults(await fetchResults(poll.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo votar')
    }
    setBusy(false)
  }

  const head = (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="section-title">{open ? 'Vota al MVP' : 'MVP de la jornada'}</h2>
      <span className="font-display text-sm font-bold uppercase tracking-wider text-white/50">Jornada {match.round} · {match.opponent}</span>
    </div>
  )

  // Votación cerrada: ganador destacado
  if (!open) {
    const winner = results?.[0] && byId(results[0].player_id)
    if (!winner) return null
    return (
      <section>
        {head}
        <Link to={`${team.base}/jugador/${winner.id}`} className="panel flex items-center gap-4 overflow-hidden bg-gradient-to-r from-club-600/60 to-club-900/40 p-4">
          <span className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-club-800">
            <PlayerImage player={winner} className="size-full" />
          </span>
          <div>
            <span className="inline-block -skew-x-12 bg-gold px-2.5 py-0.5 font-display text-xs font-extrabold uppercase tracking-wider text-club-950">MVP · Jornada {match.round}</span>
            <p className="mt-1.5 font-display text-3xl font-extrabold uppercase italic leading-none">{winner.firstName} {winner.lastName}</p>
            <p className="text-sm text-white/60">{pct(winner.id)}% de {total} {total === 1 ? 'voto' : 'votos'}</p>
          </div>
        </Link>
      </section>
    )
  }

  return (
    <section>
      {head}
      <div className="panel p-4">
        <p className="mb-3 text-sm text-white/60">{showResults ? `Gracias por votar · ${total} ${total === 1 ? 'voto' : 'votos'}` : `¿Quién fue el mejor? Un voto por dispositivo. Se cierra el ${fmtCloses(poll)}.`}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <button
                disabled={busy || showResults}
                onClick={() => submit(p.id)}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-2 text-left transition ${
                  voted === p.id ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5 enabled:hover:bg-white/10'
                }`}
              >
                {showResults && <span className="absolute inset-y-0 left-0 bg-white/10" style={{ width: `${pct(p.id)}%` }} aria-hidden />}
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-club-800">
                  <PlayerImage player={p} className="size-full" />
                </span>
                <span className="relative min-w-0 flex-1 truncate text-sm font-semibold">{p.firstName} {p.lastName}</span>
                {showResults && <span className="relative text-sm font-bold tabular-nums">{pct(p.id)}%</span>}
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  )
}
