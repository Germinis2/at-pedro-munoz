export const club = {
  name: 'At. Pedro Muñoz C.F.',
  shortName: 'At. Pedro Muñoz',
  region: 'Castilla-La Mancha',
  season: '2026/27',
  stadium: 'Juande Ramos',
  town: 'Pedro Muñoz',
  crest: '/escudo.webp',
  whatsapp: '34687815646', // tienda: pedidos por WhatsApp (con prefijo de España)
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
