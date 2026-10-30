import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TeamProvider, TeamsProvider } from './data/teams'
import { Home } from './pages/Home'
import { Matches } from './pages/Matches'
import { Player } from './pages/Player'
import { Squad } from './pages/Squad'
import { Stats } from './pages/Stats'
import { Table } from './pages/Table'

// El panel de administración se carga aparte: el público no descarga su código
const Admin = lazy(() => import('./admin/Admin'))

// Mismas páginas para cada equipo: el primer equipo en "/" y el juvenil en "/juvenil"
const teamRoutes = (team: 'primer' | 'juvenil', path: string) => (
  <Route
    path={path}
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
    <TeamsProvider>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="p-10 text-center text-white/50">Cargando…</p>}>
              <Admin />
            </Suspense>
          }
        />
        {teamRoutes('primer', '/')}
        {teamRoutes('juvenil', '/juvenil')}
      </Routes>
    </TeamsProvider>
  )
}
