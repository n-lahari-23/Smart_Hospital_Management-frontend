import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Activity, Award, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export const Home = ({ setActivePage }) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.getDepartments()
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load departments on Home:', err));
    api.getDoctors()
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load doctors on Home:', err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1>Smart Healthcare,<br/>Instant Consultation Queues</h1>
          <p>
            Experience seamless digital healthcare booking. Check live doctor availability, receive automated token numbers, and consult top medical specialists without long waiting lines.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }} onClick={() => setActivePage('doctors')}>
              Book Appointment Now <ArrowRight size={20} />
            </button>
            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }} onClick={() => setActivePage('login')}>
              Patient / Doctor Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
        <div className="card stat-card">
          <div className="stat-icon blue"><Users /></div>
          <div>
            <div className="stat-val">15,000+</div>
            <div className="stat-lbl">Registered Patients</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon teal"><Award /></div>
          <div>
            <div className="stat-val">{doctors.length || 10}+</div>
            <div className="stat-lbl">Expert Specialists</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><Clock /></div>
          <div>
            <div className="stat-val">Real-Time</div>
            <div className="stat-lbl">Live Token Queue</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon purple"><ShieldCheck /></div>
          <div>
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Digital Prescriptions</div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>How It Works</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Streamlined 4-step process for effortless patient care</p>
        
        <div className="grid grid-4">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>1</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Register Account</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign up in under 30 seconds as a patient to access hospital services.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--teal-light)', color: 'var(--secondary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>2</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Select Doctor & Slot</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Browse departments, view doctor schedules, and choose your preferred time.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>3</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Receive Token #</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get an instant queue token number and track your status in real-time.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>4</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Consult & Prescription</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consult your doctor and access digital prescriptions and notes online.</p>
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Medical Departments</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Comprehensive care across specialized medicine</p>

        <div className="grid grid-3">
          {departments.map((dept) => (
            <div key={dept.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Activity size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{dept.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dept.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
