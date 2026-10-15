import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Calendar, Ticket, FileText, Clock, XCircle, RefreshCw } from 'lucide-react';
import { RescheduleModal } from '../components/RescheduleModal';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      const data = await api.getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load patient appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (app) => {
    const confirm = window.confirm(
      `Cancel your consultation with ${app.doctorName || 'the doctor'} on ${app.appointmentDate} at ${app.appointmentTime}?\n\nThis will immediately release the time slot for other patients.`
    );
    if (!confirm) return;

    try {
      await api.cancelAppointment(app.id);
      setActionMsg(`Appointment on ${app.appointmentDate} was cancelled successfully. Slot has been freed.`);
      loadAppointments();
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Appointments & Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track appointment token status, reschedule slots, or review prescriptions</p>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={loadAppointments}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading appointment records...</div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No appointments booked yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Browse available doctors and book your next consultation.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {appointments.map(app => {
            const canModify = app.status === 'PENDING' || app.status === 'CONFIRMED';
            const borderColor = app.status === 'CANCELLED' ? '#ef4444' : app.status === 'COMPLETED' ? '#10b981' : 'var(--primary)';

            return (
              <div key={app.id} className="card" style={{ borderLeft: `5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
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

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                    <div><strong>Date:</strong> {app.appointmentDate}</div>
                    <div><strong>Time:</strong> {app.appointmentTime}</div>
                    {app.consultationFee !== undefined && app.consultationFee !== null && (
                      <div><strong>Consultation Fee:</strong> {formatCurrency(app.consultationFee)}</div>
                    )}
                    {app.symptoms && <div><strong>Symptoms:</strong> {app.symptoms}</div>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  {canModify && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        onClick={() => setReschedulingApp(app)}
                      >
                        <Clock size={14} /> Reschedule Slot
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        onClick={() => handleCancel(app)}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  )}

                  {app.prescriptionId && (
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => handleViewPrescription(app.id)}>
                      <FileText size={16} /> View Prescription & Notes
                    </button>
                  )}

                  {app.status === 'CANCELLED' && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', fontStyle: 'italic', textAlign: 'center' }}>
                      Slot released. You can book a new appointment anytime.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingApp && (
        <RescheduleModal
          appointment={reschedulingApp}
          onClose={() => setReschedulingApp(null)}
          onSuccess={() => {
            setReschedulingApp(null);
            loadAppointments();
          }}
        />
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
