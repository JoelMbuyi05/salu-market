import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import PostListing from './pages/PostListing'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import IOSInstallBanner from './components/IOSInstallerBanner'
import SplashScreen from './components/SplashScreen'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )
    return user ? children : <Navigate to="/login" />
}

export default function App() {
    const [showSplash, setShowSplash] = useState(true)

    return (
        <>
            {showSplash && (
                <SplashScreen onFinish={() => setShowSplash(false)} />
            )}

            <BrowserRouter>
                <IOSInstallBanner />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/listing/:id" element={<ListingDetail />} />
                    <Route path="/post" element={
                        <ProtectedRoute>
                            <PostListing />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </>
    )
}