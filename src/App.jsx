import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Chargement...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/listing/:id" element={
          <ProtectedRoute>
            <ListingDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}