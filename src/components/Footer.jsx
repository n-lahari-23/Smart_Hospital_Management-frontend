import React from 'react';
import { Activity, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: 'white', padding: '3rem 2rem 1.5rem 2rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginBottom: '1rem' }}>
            <Activity size={24} /> MediCare Smart Hospital
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Advanced healthcare platform providing real-time token queues, instant appointment booking, and seamless digital doctor consultations.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '2' }}>
            <li>Emergency Care & ER</li>
            <li>Cardiology & Neurology</li>
            <li>Pediatrics & Dermatology</li>
            <li>24/7 Pharmacy Services</li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>Contact Support</h4>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Phone size={16} /> +1 (800) 555-HEALTH
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Mail size={16} /> support@medicarehospital.com
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <MapPin size={16} /> 100 Health Sciences Blvd, NY
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'center', borderTop: '1px solid #334155', marginTop: '2.5rem', paddingTop: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} Smart Hospital Management System. All rights reserved.
      </div>
    </footer>
  );
};
