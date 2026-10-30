// Silueta genérica de jugador hasta tener fotos recortadas (PNG sin fondo)
export function Silhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 360" className={className} aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="sil-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".08" />
        </linearGradient>
        <linearGradient id="sil-shirt" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#e5263f" />
          <stop offset="1" stopColor="#7a1022" />
        </linearGradient>
      </defs>
      {/* cabeza y cuello */}
      <ellipse cx="150" cy="92" rx="46" ry="54" fill="url(#sil-body)" />
      <path d="M128 136h44v34h-44z" fill="url(#sil-body)" />
      {/* camiseta */}
      <path
        d="M150 166c-22 0-34-8-40-10-30 8-62 18-74 34-14 20-22 70-24 170h276c-2-100-10-150-24-170-12-16-44-26-74-34-6 2-18 10-40 10Z"
        fill="url(#sil-shirt)"
      />
      <path d="M110 156c8 14 22 22 40 22s32-8 40-22" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="4" />
      {/* brazos cruzados insinuados */}
      <path d="M58 262c40 22 140 22 184 0" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="26" strokeLinecap="round" />
    </svg>
  )
}
