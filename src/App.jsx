import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Modules from './pages/Modules'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/quizzes" element={<Navigate to="/modules" />} />
        <Route path="/progress" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  )
}