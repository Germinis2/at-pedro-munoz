// Genera supabase/seed.sql con los datos de partida (src/data/*/seed.ts).
// Uso: node scripts/seed.mjs && npx supabase db push --include-seed
// Node ejecuta los .ts directamente (eliminación de tipos), sin compilar.
import { writeFile } from 'node:fs/promises'
import { juvenilSeed } from '../src/data/juvenil/seed.ts'
import { primerSeed } from '../src/data/primer/seed.ts'

const q = (v) => {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return `array[${v.map(q).join(', ')}]::text[]`
  if (typeof v === 'object') return `${q(JSON.stringify(v))}::jsonb`
  return `'${String(v).replaceAll("'", "''")}'`
}

const insert = (table, rows, omit = []) => {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0]).filter((c) => !omit.includes(c))
  const values = rows.map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`).join(',\n')
  return `insert into public.${table} (${cols.join(', ')}) values\n${values};\n\n`
}

let sql = '-- Generado por scripts/seed.mjs: no editar a mano\n\n'
for (const s of [primerSeed, juvenilSeed]) {
  sql += `-- ${s.team.label}\n`
  sql += insert('teams', [s.team])
  sql += insert('players', s.players)
  sql += insert('matches', s.matches, ['id']) // el id lo pone la base de datos
  sql += insert('standings', s.standings)
}
await writeFile('supabase/seed.sql', sql)
console.log('supabase/seed.sql:', sql.length, 'caracteres')
