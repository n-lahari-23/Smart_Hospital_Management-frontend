import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { X, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [newDate, setNewDate] = useState(() => {
    // Default to tomorrow or current date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [slotsResponse, setSlotsResponse] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadSlots = useCallback(async (date) => {
    if (!appointment?.doctorId || !date) return;
    setLoadingSlots(true);
    setError('');
    setNewTime('');
    try {
      const res = await api.getAvailableSlots(appointment.doctorId, date);
      setSlotsResponse(res);
      // Auto-select first available slot if any
      const firstAvailable = (res.slots || []).find(s => s.available);
      if (firstAvailable) {
        setNewTime(firstAvailable.time);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch doctor slots for this date');
      setSlotsResponse(null);
    } finally {
      setLoadingSlots(false);
    }
  }, [appointment?.doctorId]);

  useEffect(() => {
    loadSlots(newDate);
  }, [newDate, loadSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTime) {
      setError('Please select an available time slot');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.rescheduleAppointment(appointment.id, newDate, newTime, reason);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="text-primary" size={20} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reschedule Consultation</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Rescheduled Successfully!
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              New appointment set for {newDate} at {newTime}. Your queue token has been updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Current details */}
            <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              <div><strong>Doctor:</strong> {appointment.doctorName} ({appointment.doctorSpecialization})</div>
              <div><strong>Current Slot:</strong> {appointment.appointmentDate} at {appointment.appointmentTime} (Token #{appointment.tokenNumber})</div>
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Choose New Date *</label>
              <input
                type="date"
                className="form-control"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </div>

            {/* Slot Picker */}
            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Available Time Slots *</span>
                {slotsResponse && (
                  <span style={{ fontSize: '0.75rem', color: slotsResponse.available ? '#059669' : '#dc2626', fontWeight: 600 }}>
                    {slotsResponse.dayOfWeek} • {slotsResponse.message}
                  </span>
                )}
              </label>

              {loadingSlots ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Loading real-time availability...
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
                      className={`btn ${newTime === slot.time ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.5rem 0.25rem',
                        opacity: slot.available ? 1 : 0.45,
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                      onClick={() => setNewTime(slot.time)}
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

            {/* Reason */}
            <div className="form-group">
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Reason for Rescheduling (Optional)</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="e.g. Schedule conflict, traveling..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={submitting || !newTime || loadingSlots || (slotsResponse && !slotsResponse.available)}
              >
                {submitting ? 'Rescheduling...' : 'Confirm New Time'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
