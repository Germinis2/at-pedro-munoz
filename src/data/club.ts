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
  // Clasificación de cada equipo en la FFCM (para copiarla y pegarla en el panel)
  ffcm: {
    primer: 'https://www.ffcm.es/pnfg/NPcd/NFG_VisClasificacion?cod_primaria=1000120&codgrupo=23022018&codcompeticion=22916217',
    juvenil: 'https://www.ffcm.es/pnfg/NPcd/NFG_VisClasificacion?cod_primaria=1000120&codgrupo=23172679&codcompeticion=22916222',
  } as Record<string, string>,
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
