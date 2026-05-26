import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Materias from './pages/Materias'
import Disciplina from './pages/Materias/Disciplina'
import { DefaultLayout } from './layouts/DefaultLayout'
import { ProtectedRoute } from './components/ProtectedRoute' // <-- Importa o guardião

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz redireciona para a home por padrão */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Bloco de Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* O DefaultLayout e tudo dentro dele só renderizam se passar pelo ProtectedRoute */}
          <Route element={<DefaultLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/materias" element={<Materias />} />
            <Route path="/materias/:id" element={<Disciplina />} />
          </Route>
        </Route>

        {/* Rota de fuga para caminhos inexistentes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App