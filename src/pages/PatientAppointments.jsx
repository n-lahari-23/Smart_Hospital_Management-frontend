import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Calendar, Ticket, FileText, Clock, User, AlertCircle } from 'lucide-react';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = async (appointmentId) => {
    try {
      const p = await api.getPrescriptionByAppointmentId(appointmentId);
      setSelectedPrescription(p);
    } catch (err) {
      alert(err.message || 'No prescription available');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Appointments & Queue</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track appointment token status and medical history</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading appointment records...</div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No appointments booked yet</h3>
        </div>
      ) : (
        <div className="grid grid-2">
          {appointments.map(app => (
            <div key={app.id} className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="token-badge">
                    <Ticket size={14} /> Token #{app.tokenNumber}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{app.doctorName}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{app.doctorSpecialization} ({app.departmentName})</div>
                </div>
                <span className={`status-badge status-${app.status}`}>{app.status}</span>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <div><strong>Date:</strong> {app.appointmentDate}</div>
                <div><strong>Time:</strong> {app.appointmentTime}</div>
                {app.consultationFee !== undefined && app.consultationFee !== null && (
                  <div><strong>Consultation Fee:</strong> {formatCurrency(app.consultationFee)}</div>
                )}
                {app.symptoms && <div><strong>Symptoms:</strong> {app.symptoms}</div>}
              </div>

              {app.prescriptionId && (
                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => handleViewPrescription(app.id)}>
                  <FileText size={16} /> View Prescription & Notes
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prescription View Modal */}
      {selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Doctor Prescription</h3>
              <button className="close-btn" onClick={() => setSelectedPrescription(null)}>×</button>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Diagnosis</h4>
              <p>{selectedPrescription.diagnosis}</p>
            </div>
            {selectedPrescription.consultationNotes && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Doctor Notes:</strong> {selectedPrescription.consultationNotes}
              </div>
            )}
            {selectedPrescription.advice && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Advice:</strong> {selectedPrescription.advice}
              </div>
            )}
            
            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Prescribed Medicines</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription.items.map(item => (
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

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setSelectedPrescription(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
