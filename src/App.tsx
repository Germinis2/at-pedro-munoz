import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TeamProvider, teams } from './data/teams'
import type { Team } from './data/types'
import { Home } from './pages/Home'
import { Matches } from './pages/Matches'
import { Player } from './pages/Player'
import { Squad } from './pages/Squad'
import { Stats } from './pages/Stats'
import { Table } from './pages/Table'

// Mismas páginas para cada equipo: el primer equipo en "/" y el juvenil en "/juvenil"
const teamRoutes = (team: Team) => (
  <Route
    path={team.base || '/'}
    element={
      <TeamProvider team={team}>
        <Layout />
      </TeamProvider>
    }
  >
    <Route index element={<Home />} />
    <Route path="partidos" element={<Matches />} />
    <Route path="clasificacion" element={<Table />} />
    <Route path="plantilla" element={<Squad />} />
    <Route path="jugador/:id" element={<Player />} />
    <Route path="estadisticas" element={<Stats />} />
    <Route path="*" element={<Home />} />
  </Route>
)

export default function App() {
  return (
    <Routes>
      {teamRoutes(teams.primer)}
      {teamRoutes(teams.juvenil)}
    </Routes>
  )
}
