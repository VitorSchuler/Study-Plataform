import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Materias from './pages/Materias'
import Disciplina from './pages/Materias/Disciplina' // <-- Adicione a importação
import { DefaultLayout } from './layouts/DefaultLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<DefaultLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/materias/:id" element={<Disciplina />} /> {/* <-- Rota Dinâmica Ativada */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App