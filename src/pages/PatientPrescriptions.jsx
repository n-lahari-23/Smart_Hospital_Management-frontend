import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, Calendar, Pill } from 'lucide-react';

export const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Medical Prescriptions</h1>
        <p style={{ color: 'var(--text-muted)' }}>Access all digital prescriptions issued during consultations</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No prescriptions record found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {prescriptions.map(p => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Diagnosis: {p.diagnosis}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Doctor Consultation Date: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}</div>
                </div>
                {p.followUpDate && (
                  <div style={{ background: 'var(--teal-light)', color: 'var(--secondary)', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                    Follow-up: {p.followUpDate}
                  </div>
                )}
              </div>

              {p.consultationNotes && <p style={{ marginBottom: '0.5rem' }}><strong>Doctor Notes:</strong> {p.consultationNotes}</p>}
              {p.advice && <p style={{ marginBottom: '1rem' }}><strong>Advice:</strong> {p.advice}</p>}

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Pill size={16} /> Rx Prescribed Medicines
              </h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.items && p.items.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.medicineName}</strong></td>
                        <td>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td>{item.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
