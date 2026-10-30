// Utilidades de nombres compartidas por la web y los scripts de Node (sin dependencias de Vite)

export const capitalize = (s: string) => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())

export const slug = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// "APELLIDOS, NOMBRE" -> partes capitalizadas
export function splitFfcm(raw: string) {
  const [surnames, name] = raw.split(',').map((s) => capitalize(s.trim()))
  return { name, surnames, id: slug(`${name} ${surnames}`), short: `${name} ${surnames.split(' ')[0]}` }
}
