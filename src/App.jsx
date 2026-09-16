import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import ConfiguracaoNecessaria from './ConfiguracaoNecessaria.jsx'
import { supabaseConfigurado } from './supabaseClient'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/configurar" element={<ConfiguracaoNecessaria />} />
    </Routes>
  )
}
