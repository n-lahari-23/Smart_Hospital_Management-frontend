import { formatCurrency } from '../utils/currency';
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { X, CheckCircle, Calendar, AlertCircle } from 'lucide-react';

export const BookAppointmentModal = ({ doctor, onClose, onSuccess }) => {
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  const [slotsResponse, setSlotsResponse] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadSlots = useCallback(async (date) => {
    if (!doctor?.id || !date) return;
    setLoadingSlots(true);
    setError('');
    setAppointmentTime('');
    try {
      const res = await api.getAvailableSlots(doctor.id, date);
      setSlotsResponse(res);
      // Auto-select first available slot if any
      const firstAvailable = (res.slots || []).find(s => s.available);
      if (firstAvailable) {
        setAppointmentTime(firstAvailable.time);
      }
    } catch (err) {
      setError(err.message || 'Unable to check doctor availability for this date');
      setSlotsResponse(null);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctor?.id]);

  useEffect(() => {
    loadSlots(appointmentDate);
  }, [appointmentDate, loadSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentTime) {
      setError('Please select an available consultation slot');
      return;
    }

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
          <button type="button" className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fee: {formatCurrency(doctor.consultationFee)} • Days: {doctor.availableDays || 'Mon-Fri'}</div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Select Consultation Date *</label>
              <input
                type="date"
                className="form-control"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Select Time Slot *</span>
                {slotsResponse && (
                  <span style={{ fontSize: '0.75rem', color: slotsResponse.available ? '#059669' : '#dc2626', fontWeight: 600 }}>
                    {slotsResponse.dayOfWeek} • {slotsResponse.message}
                  </span>
                )}
              </label>

              {loadingSlots ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Checking available slots...
                </div>
              ) : slotsResponse && !slotsResponse.available ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '10px', fontSize: '0.88rem' }}>
                  {slotsResponse.message || 'Doctor is not available on this date. Please pick another date.'}
                </div>
              ) : slotsResponse?.slots?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                  {slotsResponse.slots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      className={`btn ${appointmentTime === slot.time ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.5rem 0.25rem',
                        opacity: slot.available ? 1 : 0.45,
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                      onClick={() => setAppointmentTime(slot.time)}
                    >
                      <span>{slot.label}</span>
                      {!slot.available && (
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          {slot.reason || 'Booked'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No slots found for this date.
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Describe Symptoms / Reason for Visit</label>
              <textarea
                className="form-control"
                rows="3"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g. Mild fever, headache for 2 days..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading || !appointmentTime || loadingSlots || (slotsResponse && !slotsResponse.available)}
            >
              {loading ? 'Confirming Booking...' : 'Confirm & Generate Queue Token'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
