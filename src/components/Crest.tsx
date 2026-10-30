// Escudo provisional: sustituir por /public/escudo.png cuando lo tengamos
export function Crest({ className = 'size-10', club = true }: { className?: string; club?: boolean }) {
  if (!club) {
    return (
      <svg viewBox="0 0 64 72" className={className} aria-hidden>
        <path d="M32 3 59 11v23c0 17-11 29-27 35C16 63 5 51 5 34V11Z" fill="rgb(255 255 255 / .08)" stroke="rgb(255 255 255 / .35)" strokeWidth="2.5" strokeDasharray="4 4" />
        <text x="32" y="43" fontSize="18" fontWeight="700" fill="rgb(255 255 255 / .5)" textAnchor="middle">?</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 72" className={className} role="img" aria-label="Escudo At. Pedro Muñoz">
      <defs>
        <linearGradient id="crest-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e5263f" />
          <stop offset="1" stopColor="#8a1020" />
        </linearGradient>
      </defs>
      <path d="M32 3 59 11v23c0 17-11 29-27 35C16 63 5 51 5 34V11Z" fill="url(#crest-g)" stroke="#fff" strokeWidth="3.5" />
      <path d="M5 26h54" stroke="#fff" strokeWidth="2" opacity=".5" />
      <text x="32" y="20" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle" letterSpacing="1">AT.</text>
      <text x="32" y="47" fontSize="17" fontWeight="800" fill="#fff" textAnchor="middle">PM</text>
    </svg>
  )
}
