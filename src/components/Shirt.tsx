export function Shirt({ number, name, className = '' }: { number: number | null; name: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={number ? `Camiseta dorsal ${number}` : 'Camiseta'}>
      <path d="M33 14 18 20 6 40l14 8 6-9v49h48V39l6 9 14-8-12-20-15-6c-2 6-8 10-17 10s-15-4-17-10Z" fill="#d11f3a" stroke="#fff" strokeOpacity=".3" />
      <text x="50" y="40" fontSize="6" fontWeight="600" fill="#fff" textAnchor="middle" letterSpacing=".5">{name.toUpperCase()}</text>
      <text x="50" y="70" fontSize="26" fontWeight="700" fill="#fff" textAnchor="middle">{number ?? '–'}</text>
    </svg>
  )
}
