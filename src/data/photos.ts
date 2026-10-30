// Fotos procesadas por scripts/fotos.mjs: src/assets/fotos/<equipo>/<id-jugador>.webp
const files = import.meta.glob('../assets/fotos/*/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export const photoFor = (team: string, id: string): string | undefined => files[`../assets/fotos/${team}/${id}.webp`]
