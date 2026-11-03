export const club = {
  name: 'At. Pedro Muñoz C.F.',
  shortName: 'At. Pedro Muñoz',
  region: 'Castilla-La Mancha',
  season: '2026/27',
  stadium: 'Juande Ramos',
  town: 'Pedro Muñoz',
  crest: '/escudo.webp',
  stadiumFull: 'Estadio Municipal Juande Ramos',
  stadiumPhoto: '/estadio.webp',
  maps: 'https://maps.app.goo.gl/MGuU6u6U9bn4FW3U8',
  whatsapp: '34687815646', // tienda: pedidos por WhatsApp (con prefijo de España)
  phone: '687 81 56 46', // contacto del pie: el mismo número que el WhatsApp
  // Grupo de cada equipo en la FFCM (para copiar sus páginas y pegarlas en el panel). Cambian cada temporada.
  ffcm: {
    primer: { temporada: 22, competicion: 22916217, grupo: 23022018 },
    juvenil: { temporada: 22, competicion: 22916222, grupo: 23172679 },
  } as Record<string, { temporada: number; competicion: number; grupo: number }>,
  social: {
    instagram: 'https://www.instagram.com/atleticopedromunoz/',
    facebook: 'https://www.facebook.com/people/ATC-PEDRO-MU%C3%91OZ/100094759347387/',
  },
}

// Escudos de los rivales en /public/escudos (generados con scripts/escudos.mjs)
const crests: Record<string, string> = {
  'C.D. Alto Júcar': 'altojucar',
  'C.D. Casas de Haro': 'casasdeharo',
  'U.D. Casasimarro': 'casasimarro',
  'C.D. Ciudad Encantada': 'ciudadencantada',
  'Cristo de la Vega C.F.': 'cristodelavega',
  'Iniestense Balompié': 'iniestense',
  'C.F. La Santa Cruz': 'lasantacruz',
  'C.D. Don Pefi Los Llanos': 'losllanos',
  'C.D. Manchego Provencio': 'manchegoprovencio',
  'U.D. Puebla de Almenara': 'puebladealmenara',
  'C.D. Triana Tresjuncos': 'trianaresjuncos',
  'C.D. Villagarcía': 'villagarcia',
  'C.P. Villarrobledo "B"': 'villarrobledo',
  // Rivales del juvenil
  'C.P. Villarrobledo': 'villarrobledo',
  'C.D. Atlético Tomelloso "B"': 'tomelloso',
  'C.F. La Solana': 'lasolana',
  'Sporting de Alcázar C.F. "B"': 'sportingalcazar',
  'C.D.U. Criptanense': 'criptanense',
  'C.D.B. Herencia': 'herencia',
  'Atlético Cervantino': 'atleticocervantino',
  'Membrilla C.F.': 'membrilla',
  'E.F.B. Atlético Valdepeñas': 'valdepenasatletico',
  'Carretero E.F.B. Valdepeñas': 'carreterovaldepenas',
  'Daimiel Racing C.F.': 'daimiel',
  'Camuñas F.C.': 'camunas',
  'U.D. Santa Cruz': 'santacruz',
}

export const crestFor = (team: string) => (crests[team] ? `/escudos/${crests[team]}.webp` : undefined)

// Páginas de la FFCM que se copian en el panel → Clasificación
export function ffcmPages(team: string) {
  const f = club.ffcm[team]
  if (!f) return null
  const base = 'https://www.ffcm.es/pnfg/NPcd'
  return {
    cruzada: `${base}/NFG_VisTablaCruzada?cod_primaria=1000120&CodGrupo=${f.grupo}`,
    calendario: `${base}/NFG_VisCalendario_Vis?cod_primaria=1000120&codtemporada=${f.temporada}&codcompeticion=${f.competicion}&codgrupo=${f.grupo}`,
    clasificacion: `${base}/NFG_VisClasificacion?cod_primaria=1000120&codgrupo=${f.grupo}&codcompeticion=${f.competicion}`,
  }
}
