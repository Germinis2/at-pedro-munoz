// Datos de la FFCM (Segunda Autonómica, Grupo 3, temporada 2026/27).
// Los jugadores se escriben tal cual aparecen en el acta: "APELLIDOS, NOMBRE".

export interface Lineup {
  starters: [number, string][]
  bench: [number, string][]
  subs: { min: number; in: string; out: string }[]
  goals: { min: number; player: string | null }[] // null = gol en propia puerta del rival
}

export interface Match {
  id: number
  round: number
  date: string // YYYY-MM-DD
  time?: string // HH:MM, vacío si aún no está fijada
  home: boolean
  opponent: string
  venue?: string
  score?: { us: number; them: number }
  acta?: number
  lineup?: Lineup
}

export const matches: Match[] = [
  {
    id: 1, round: 1, date: '2026-10-04', time: '18:00', home: true,
    opponent: 'U.D. Puebla de Almenara', venue: 'Juande Ramos', score: { us: 3, them: 0 }, acta: 598001,
    lineup: {
      starters: [[13, 'SALIDO MOLINA, SERGIO'], [2, 'ZARCO MARTINEZ, JORGE'], [5, 'HEREDIA MORALES, ISMAEL'], [7, 'HERREROS RODRIGUEZ, ALEJANDRO'], [8, 'VILLEGAS PULPON, VICTOR'], [9, 'MOURA FERREIRA, JACKSON'], [10, 'FERNANDEZ MUÑOZ, ALVARO'], [11, 'PULPON BUENDIA, REYES'], [12, 'RAMOS LOPEZ, JOSE LUIS'], [16, 'ESCUDERO RIVAS, SAMUEL'], [19, 'MONEDERO ALBERCA, CARLOS']],
      bench: [[1, 'GONZALEZ FERNANDEZ, ISMAEL'], [3, 'MERINO FERNANDEZ, IVAN'], [6, 'DELGADO AYUSO MORALES, DIEGO'], [15, 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO'], [18, 'SANCHEZ ALBERCA, JAIME'], [21, 'BOUNAB CHARQI, ISMAEL'], [26, 'MUÑOZ PLIEGO, PABLO']],
      subs: [
        { min: 45, in: 'MUÑOZ PLIEGO, PABLO', out: 'PULPON BUENDIA, REYES' },
        { min: 59, in: 'MERINO FERNANDEZ, IVAN', out: 'RAMOS LOPEZ, JOSE LUIS' },
        { min: 59, in: 'BOUNAB CHARQI, ISMAEL', out: 'FERNANDEZ MUÑOZ, ALVARO' },
        { min: 70, in: 'SANCHEZ ALBERCA, JAIME', out: 'MOURA FERREIRA, JACKSON' },
        { min: 80, in: 'DELGADO AYUSO MORALES, DIEGO', out: 'ESCUDERO RIVAS, SAMUEL' },
      ],
      goals: [
        { min: 16, player: 'MOURA FERREIRA, JACKSON' },
        { min: 77, player: 'SANCHEZ ALBERCA, JAIME' },
        { min: 83, player: 'SANCHEZ ALBERCA, JAIME' },
      ],
    },
  },
  {
    id: 2, round: 2, date: '2026-10-11', time: '12:00', home: false,
    opponent: 'C.D. Triana Tresjuncos', venue: 'Municipal - Belmonte', score: { us: 2, them: 2 }, acta: 598009,
    lineup: {
      starters: [[1, 'SALIDO MOLINA, SERGIO'], [2, 'ZARCO MARTINEZ, JORGE'], [3, 'MERINO FERNANDEZ, IVAN'], [5, 'HEREDIA MORALES, ISMAEL'], [6, 'DELGADO AYUSO MORALES, DIEGO'], [11, 'PULPON BUENDIA, REYES'], [14, 'HERREROS RODRIGUEZ, ALEJANDRO'], [16, 'ESCUDERO RIVAS, SAMUEL'], [19, 'MONEDERO ALBERCA, CARLOS'], [21, 'BOUNAB CHARQI, ISMAEL'], [26, 'MUÑOZ PLIEGO, PABLO']],
      bench: [[13, 'ROSU BASCUÑANA, ALEXIS'], [4, 'ESCUDERO RIVAS, ISAAC'], [7, 'YUSTE MUÑOZ, ADRIAN'], [10, 'FERNANDEZ MUÑOZ, ALVARO'], [12, 'RAMOS LOPEZ, JOSE LUIS'], [15, 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO'], [18, 'SANCHEZ ALBERCA, JAIME'], [22, 'RAMOS LOPEZ, JAVIER']],
      subs: [
        { min: 54, in: 'ESCUDERO RIVAS, ISAAC', out: 'MUÑOZ PLIEGO, PABLO' },
        { min: 54, in: 'FERNANDEZ MUÑOZ, ALVARO', out: 'DELGADO AYUSO MORALES, DIEGO' },
        { min: 70, in: 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO', out: 'PULPON BUENDIA, REYES' },
        { min: 80, in: 'SANCHEZ ALBERCA, JAIME', out: 'HERREROS RODRIGUEZ, ALEJANDRO' },
      ],
      goals: [
        { min: 4, player: 'PULPON BUENDIA, REYES' },
        { min: 0, player: null }, // el acta no deja claro el minuto del gol en propia puerta
      ],
    },
  },
  {
    id: 3, round: 3, date: '2026-10-18', time: '17:00', home: true,
    opponent: 'C.D. Casas de Haro', venue: 'Juande Ramos', score: { us: 5, them: 0 }, acta: 598016,
    lineup: {
      starters: [[13, 'SALIDO MOLINA, SERGIO'], [2, 'ZARCO MARTINEZ, JORGE'], [3, 'MERINO FERNANDEZ, IVAN'], [5, 'HEREDIA MORALES, ISMAEL'], [6, 'DELGADO AYUSO MORALES, DIEGO'], [8, 'VILLEGAS PULPON, VICTOR'], [12, 'RAMOS LOPEZ, JOSE LUIS'], [14, 'HERREROS RODRIGUEZ, ALEJANDRO'], [16, 'ESCUDERO RIVAS, SAMUEL'], [17, 'CASERO VILLALGORDO, JAVIER'], [23, 'FELGUERA PEREA, DANIEL']],
      bench: [[1, 'ROSU BASCUÑANA, ALEXIS'], [4, 'ESCUDERO RIVAS, ISAAC'], [10, 'FERNANDEZ MUÑOZ, ALVARO'], [11, 'PULPON BUENDIA, REYES'], [15, 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO'], [20, 'PLATAS MUÑOZ, JESUS'], [21, 'BOUNAB CHARQI, ISMAEL'], [22, 'RAMOS LOPEZ, JAVIER'], [26, 'MUÑOZ PLIEGO, PABLO']],
      subs: [
        { min: 52, in: 'PULPON BUENDIA, REYES', out: 'CASERO VILLALGORDO, JAVIER' },
        { min: 58, in: 'PLATAS MUÑOZ, JESUS', out: 'DELGADO AYUSO MORALES, DIEGO' },
        { min: 75, in: 'FERNANDEZ MUÑOZ, ALVARO', out: 'FELGUERA PEREA, DANIEL' },
        { min: 75, in: 'RAMOS LOPEZ, JAVIER', out: 'HERREROS RODRIGUEZ, ALEJANDRO' },
        { min: 75, in: 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO', out: 'ZARCO MARTINEZ, JORGE' },
      ],
      goals: [
        { min: 17, player: 'CASERO VILLALGORDO, JAVIER' },
        { min: 44, player: 'HERREROS RODRIGUEZ, ALEJANDRO' },
        { min: 61, player: 'ZARCO MARTINEZ, JORGE' },
        { min: 74, player: 'HERREROS RODRIGUEZ, ALEJANDRO' },
        { min: 88, player: 'PULPON BUENDIA, REYES' },
      ],
    },
  },
  {
    id: 4, round: 4, date: '2026-10-24', time: '17:00', home: false,
    opponent: 'Cristo de la Vega C.F.', venue: 'Paquito Jiménez - Socuéllamos', score: { us: 2, them: 0 }, acta: 598024,
    lineup: {
      starters: [[13, 'SALIDO MOLINA, SERGIO'], [2, 'ZARCO MARTINEZ, JORGE'], [3, 'MERINO FERNANDEZ, IVAN'], [5, 'HEREDIA MORALES, ISMAEL'], [6, 'DELGADO AYUSO MORALES, DIEGO'], [7, 'HERREROS RODRIGUEZ, ALEJANDRO'], [8, 'VILLEGAS PULPON, VICTOR'], [16, 'ESCUDERO RIVAS, SAMUEL'], [17, 'CASERO VILLALGORDO, JAVIER'], [20, 'PLATAS MUÑOZ, JESUS'], [23, 'FELGUERA PEREA, DANIEL']],
      bench: [[21, 'BOUNAB CHARQI, ISMAEL'], [4, 'ESCUDERO RIVAS, ISAAC'], [10, 'FERNANDEZ MUÑOZ, ALVARO'], [11, 'PULPON BUENDIA, REYES'], [15, 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO'], [22, 'RAMOS LOPEZ, JAVIER'], [24, 'PORRERO MOTA, HUGO'], [26, 'MUÑOZ PLIEGO, PABLO']],
      subs: [
        { min: 45, in: 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO', out: 'CASERO VILLALGORDO, JAVIER' },
        { min: 59, in: 'FERNANDEZ MUÑOZ, ALVARO', out: 'DELGADO AYUSO MORALES, DIEGO' },
        { min: 64, in: 'PORRERO MOTA, HUGO', out: 'FELGUERA PEREA, DANIEL' },
        { min: 64, in: 'BOUNAB CHARQI, ISMAEL', out: 'PLATAS MUÑOZ, JESUS' },
        { min: 85, in: 'PULPON BUENDIA, REYES', out: 'DELGADO FERNANDEZ CAÑADAS, GUILLERMO' },
      ],
      goals: [
        { min: 20, player: 'FELGUERA PEREA, DANIEL' },
        { min: 66, player: 'HERREROS RODRIGUEZ, ALEJANDRO' },
      ],
    },
  },
  { id: 5, round: 5, date: '2026-11-07', time: '17:00', home: true, opponent: 'Iniestense Balompié', venue: 'Juande Ramos' },
  { id: 6, round: 6, date: '2026-11-15', home: false, opponent: 'C.D. Alto Júcar', venue: 'Ignacio Megías - Villalgordo del Júcar' },
  { id: 7, round: 7, date: '2026-11-22', home: true, opponent: 'C.D. Ciudad Encantada', venue: 'Juande Ramos' },
  { id: 8, round: 8, date: '2026-11-29', home: false, opponent: 'C.D. Manchego Provencio' },
  { id: 9, round: 9, date: '2026-12-13', home: true, opponent: 'C.D. Villagarcía', venue: 'Juande Ramos' },
  { id: 10, round: 10, date: '2026-12-20', home: false, opponent: 'C.P. Villarrobledo "B"' },
]

export const kickoff = (m: Match) => new Date(`${m.date}T${m.time ?? '00:00'}`)

export const upcoming = (now = new Date()) =>
  matches.filter((m) => !m.score && kickoff(m) >= new Date(now.toDateString())).sort((a, b) => a.date.localeCompare(b.date))

export const played = () =>
  matches.filter((m) => m.score).sort((a, b) => b.date.localeCompare(a.date))

export const actaUrl = (acta: number) =>
  `https://www.ffcm.es/pnfg/NPcd/NFG_CmpPartido?cod_primaria=1000120&CodActa=${acta}&cod_acta=${acta}`
