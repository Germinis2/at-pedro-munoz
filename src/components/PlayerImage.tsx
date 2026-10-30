import type { Player } from '../data/types'
import { Silhouette } from './Silhouette'

// Foto del jugador si la tenemos; si no, la silueta genérica
export function PlayerImage({ player, className = '', photoClassName }: { player: Player; className?: string; photoClassName?: string }) {
  if (player.photo) {
    return <img src={player.photo} alt={player.fullName} loading="lazy" className={`object-cover object-top ${photoClassName ?? className}`} />
  }
  return <Silhouette className={className} />
}
