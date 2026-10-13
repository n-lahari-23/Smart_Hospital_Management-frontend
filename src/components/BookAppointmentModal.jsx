import { formatCurrency } from '../utils/currency';
import React, { useState } from 'react';
import { api } from '../services/api';
import { X, CheckCircle } from 'lucide-react';

export const BookAppointmentModal = ({ doctor, onClose, onSuccess }) => {
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00:00');
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  const timeSlots = [
    '09:00:00', '09:30:00', '10:00:00', '10:30:00',
    '11:00:00', '11:30:00', '14:00:00', '14:30:00', '15:00:00'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.bookAppointment({
        doctorId: doctor.id,
        appointmentDate,
        appointmentTime,
        symptoms
      });
      setBookedDetails(res);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{bookedDetails ? 'Appointment Confirmed!' : 'Book Appointment'}</h3>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {bookedDetails ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Booking Confirmed
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your appointment has been registered in the system.</p>

            <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 700 }}>YOUR QUEUE TOKEN</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>
                #{bookedDetails.tokenNumber}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Present this token at the reception desk</div>
            </div>

            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div><strong>Doctor:</strong> {bookedDetails.doctorName}</div>
              <div><strong>Date:</strong> {bookedDetails.appointmentDate}</div>
              <div><strong>Time:</strong> {bookedDetails.appointmentTime}</div>
              <div><strong>Consultation Fee:</strong> {formatCurrency(bookedDetails.consultationFee || doctor.consultationFee)}</div>
              <div><strong>Status:</strong> <span className={`status-badge status-${bookedDetails.status}`}>{bookedDetails.status}</span></div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => { onSuccess(); onClose(); }}>
              Go to My Appointments
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem' }}>{doctor.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{doctor.specialization} ({doctor.departmentName})</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fee: {formatCurrency(doctor.consultationFee)}</div>
              </div>
            </div>

            <div className="form-group">
              <label>Select Date *</label>
              <input type="date" className="form-control" required min={new Date().toISOString().split('T')[0]} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Select Time Slot *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`btn ${appointmentTime === slot ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    onClick={() => setAppointmentTime(slot)}
                  >
                    {slot.substring(0, 5)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Describe Symptoms / Reason for Visit</label>
              <textarea className="form-control" rows="3" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Mild fever, headache for 2 days..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Confirming Booking...' : 'Confirm & Generate Queue Token'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
