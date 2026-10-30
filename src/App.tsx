import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Matches } from './pages/Matches'
import { Player } from './pages/Player'
import { Squad } from './pages/Squad'
import { Stats } from './pages/Stats'
import { Table } from './pages/Table'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="partidos" element={<Matches />} />
        <Route path="clasificacion" element={<Table />} />
        <Route path="plantilla" element={<Squad />} />
        <Route path="jugador/:id" element={<Player />} />
        <Route path="estadisticas" element={<Stats />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
