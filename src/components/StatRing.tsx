export function StatRing({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 52
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative size-24 md:size-36">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="5" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-3xl font-semibold md:text-4xl">{value}</span>
      </div>
      <figcaption className="text-center text-sm font-semibold">{label}</figcaption>
    </figure>
  )
}
