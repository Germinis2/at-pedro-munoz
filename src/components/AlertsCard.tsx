import { useState } from 'react'
import { disablePush, enablePush, pushSupport, subscribedTeams } from '../data/push'
import { useTeam } from '../data/teams'
import { BellIcon } from './Icons'

// Botón de la portada para activar los avisos del equipo (votación del MVP y resultado final)
export function AlertsCard() {
  const team = useTeam()
  const support = pushSupport()
  const [on, setOn] = useState(() => subscribedTeams().includes(team.id))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [help, setHelp] = useState(false)

  if (support === 'unsupported') return null
  const blocked = support === 'ok' && Notification.permission === 'denied'

  const toggle = async () => {
    setBusy(true)
    setMsg('')
    try {
      if (on) await disablePush(team.id)
      else await enablePush(team.id)
      setOn(!on)
    } catch (e) {
      setMsg(e instanceof Error && e.message === 'denied'
        ? 'No has dado permiso. Puedes activarlo en los ajustes del navegador para esta web.'
        : 'No se han podido activar los avisos. Inténtalo de nuevo.')
    }
    setBusy(false)
  }

  return (
    <section className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <span className={`flex size-11 shrink-0 -skew-x-12 items-center justify-center ${on ? 'bg-club-500' : 'bg-white/10'}`}>
          <BellIcon className="size-6 skew-x-12" />
        </span>
        <div>
          <p className="font-display text-lg font-extrabold uppercase italic leading-tight">
            Avisos {team.full ? 'del primer equipo' : 'del juvenil'}
          </p>
          <p className="mt-0.5 text-sm text-white/60">
            {on
              ? 'Activados. Te avisaremos al abrir la votación del MVP y con el resultado final.'
              : 'Te avisamos al abrir la votación del MVP y cuando esté el resultado final de cada partido.'}
          </p>
          {msg && <p className="mt-1 text-sm text-club-300">{msg}</p>}
          {blocked && !on && <p className="mt-1 text-sm text-club-300">Los tienes bloqueados: actívalos en los ajustes del navegador para esta web.</p>}
          {support === 'insecure' && <p className="mt-1 text-xs text-white/40">Disponible cuando la web esté publicada (https).</p>}
          {help && (
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-white/70">
              <li>Toca el botón <b>Compartir</b> de Safari.</li>
              <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
              <li>Abre la web desde el nuevo icono y pulsa aquí <b>Activar avisos</b>.</li>
            </ol>
          )}
        </div>
      </div>
      {support === 'ios-install' ? (
        <button onClick={() => setHelp(!help)} className="-skew-x-12 border border-white/20 px-5 py-2.5 font-display font-bold uppercase tracking-wider hover:border-white/40">
          <span className="inline-block skew-x-12">{help ? 'Cerrar' : 'Cómo activarlos'}</span>
        </button>
      ) : (
        <button
          onClick={toggle}
          disabled={busy || support !== 'ok' || (blocked && !on)}
          className={`-skew-x-12 px-5 py-2.5 font-display font-bold uppercase tracking-wider transition disabled:opacity-40 ${
            on ? 'border border-white/20 text-white/70 hover:border-white/40' : 'bg-club-500 text-white hover:bg-club-600'
          }`}
        >
          <span className="inline-block skew-x-12">{busy ? '…' : on ? 'Desactivar' : 'Activar avisos'}</span>
        </button>
      )}
    </section>
  )
}
