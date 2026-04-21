import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, GraduationCap, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(11,15,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <GraduationCap size={20} color="#0b0f1a" />
        </div>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 16, fontWeight: 700, lineHeight: 1.1, color: '#f0ece4' }}>
            SPM Patel College
          </div>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.08em' }}>
            BCA 2023 – 26
          </div>
        </div>
      </Link>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated && isAdmin ? (
          <>
            <Link to="/admin" className="btn btn-outline btn-sm">
              <Settings size={14} /> Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : isAuthenticated ? (
          <Link to="/admin" className="btn btn-primary btn-sm">
            <Settings size={14} /> Admin
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
