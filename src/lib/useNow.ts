import { useEffect, useState } from 'react'

// Hora actual que se refresca cada `ms` (para relojes y cuentas atrás)
export function useNow(ms = 15_000, enabled = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms, enabled])
  return now
}
