import { club as clubData } from '../data/club'

// Escudo del club, o un escudo genérico para los rivales
export function Crest({ className = 'size-10', club = true }: { className?: string; club?: boolean }) {
  if (club) {
    return <img src={clubData.crest} alt={`Escudo ${clubData.name}`} className={`object-contain ${className}`} />
  }
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden>
      <path d="M32 3 59 11v23c0 17-11 29-27 35C16 63 5 51 5 34V11Z" fill="rgb(255 255 255 / .08)" stroke="rgb(255 255 255 / .35)" strokeWidth="2.5" />
      <path d="M20 28h24M20 38h24M24 48h16" stroke="rgb(255 255 255 / .25)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
