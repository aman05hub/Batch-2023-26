import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AlbumView from './pages/AlbumView';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminAlbum from './pages/AdminAlbum';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:id" element={<AlbumView />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/album/:id" element={<ProtectedRoute><AdminAlbum /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e2a3a', color: '#f0ece4', border: '1px solid rgba(255,255,255,0.08)' },
            success: { iconTheme: { primary: '#c9a84c', secondary: '#0b0f1a' } }
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
