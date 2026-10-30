import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export const inputCls =
  'w-full min-w-0 rounded-lg border border-white/15 bg-club-950/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-club-300 focus:outline-none'

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-club-300">{label}</span>
      {children}
    </label>
  )
}

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className ?? ''}`} />

export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${inputCls} ${p.className ?? ''}`} />

export function Button({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const v = {
    primary: 'bg-white text-club-800 hover:bg-club-100',
    ghost: 'bg-white/10 text-white hover:bg-white/15',
    danger: 'bg-red-600/80 text-white hover:bg-red-600',
  }[variant]
  return <button {...p} className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${v} ${className}`} />
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'error' | 'ok'; children: ReactNode }) {
  const c = { info: 'border-white/15 bg-white/5', error: 'border-red-400/40 bg-red-500/15', ok: 'border-emerald-400/40 bg-emerald-500/15' }[kind]
  return <p className={`rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</p>
}

export const num = (v: string) => (v === '' ? null : Number(v))
