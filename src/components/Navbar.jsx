import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, User, LogOut, Calendar, Stethoscope, Shield, Home, Search, FileText } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setActivePage('home')}>
        <div className="nav-brand-icon">
          <Activity size={24} />
        </div>
        <span>MediCare <span style={{ color: 'var(--secondary)', fontSize: '0.85em' }}>Smart Hospital</span></span>
      </div>

      <ul className="nav-links">
        <li>
          <button className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>
            <Home size={18} /> Home
          </button>
        </li>
        <li>
          <button className={`nav-link ${activePage === 'doctors' ? 'active' : ''}`} onClick={() => setActivePage('doctors')}>
            <Search size={18} /> Find Doctors
          </button>
        </li>

        {user && user.role === 'PATIENT' && (
          <>
            <li>
              <button className={`nav-link ${activePage === 'my-appointments' ? 'active' : ''}`} onClick={() => setActivePage('my-appointments')}>
                <Calendar size={18} /> Appointments
              </button>
            </li>
            <li>
              <button className={`nav-link ${activePage === 'my-prescriptions' ? 'active' : ''}`} onClick={() => setActivePage('my-prescriptions')}>
                <FileText size={18} /> Prescriptions
              </button>
            </li>
            <li>
              <button className={`nav-link ${activePage === 'patient-profile' ? 'active' : ''}`} onClick={() => setActivePage('patient-profile')}>
                <User size={18} /> My Profile
              </button>
            </li>
          </>
        )}

        {user && user.role === 'DOCTOR' && (
          <li>
            <button className={`nav-link ${activePage === 'doctor-dashboard' ? 'active' : ''}`} onClick={() => setActivePage('doctor-dashboard')}>
              <Stethoscope size={18} /> Doctor Portal
            </button>
          </li>
        )}

        {user && user.role === 'ADMIN' && (
          <li>
            <button className={`nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`} onClick={() => setActivePage('admin-dashboard')}>
              <Shield size={18} /> Admin Console
            </button>
          </li>
        )}

        {user ? (
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
            <NotificationBell />
            <span className="user-badge">
              <User size={14} /> {user.name} ({user.role})
            </span>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </li>
        ) : (
          <li style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setActivePage('login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => setActivePage('register')}>Register</button>
          </li>
        )}
      </ul>
    </nav>
  );
};
