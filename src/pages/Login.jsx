import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Key, Mail, UserCheck } from 'lucide-react';

export const Login = ({ setActivePage }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'PATIENT') setActivePage('my-appointments');
      else if (user.role === 'DOCTOR') setActivePage('doctor-dashboard');
      else if (user.role === 'ADMIN') setActivePage('admin-dashboard');
      else setActivePage('home');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('admin123');
    try {
      setLoading(true);
      const user = await login(demoEmail, 'admin123');
      if (user.role === 'PATIENT') setActivePage('my-appointments');
      else if (user.role === 'DOCTOR') setActivePage('doctor-dashboard');
      else if (user.role === 'ADMIN') setActivePage('admin-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access your Smart Hospital account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ QUICK DEMO LOGINS (Click to Login)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleDemoLogin('john.doe@gmail.com')}>
              <UserCheck size={16} style={{ color: '#0284c7' }} /> Patient Demo (John Doe)
            </button>
            <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleDemoLogin('robert.chen@hospital.com')}>
              <UserCheck size={16} style={{ color: '#0d9488' }} /> Doctor Demo (Dr. Robert Chen)
            </button>
            <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleDemoLogin('admin@hospital.com')}>
              <UserCheck size={16} style={{ color: '#7c3aed' }} /> Admin Demo (System Admin)
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActivePage('register')}>Register Patient</span>
        </div>
      </div>
    </div>
  );
};
