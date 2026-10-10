import React, { useEffect, useState, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Ticket, CheckCircle, Clock, FilePlus, Calendar, Phone } from 'lucide-react';
import { ConsultationModal } from './ConsultationModal';

export const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [consultingApp, setConsultingApp] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctorAppointments(selectedDate);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Doctor Portal & Queue Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontWeight: 700 }}>Select Date:</label>
          <input type="date" className="form-control" style={{ width: 'auto' }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon blue"><Users /></div>
          <div>
            <div className="stat-val">{appointments.length}</div>
            <div className="stat-lbl">Total Appointments Today</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon amber"><Clock /></div>
          <div>
            <div className="stat-val">{pendingCount}</div>
            <div className="stat-lbl">Waiting in Queue</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle /></div>
          <div>
            <div className="stat-val">{completedCount}</div>
            <div className="stat-lbl">Completed Consultations</div>
          </div>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Patient Live Queue</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading patient queue...</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No appointments scheduled for this date.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Details</th>
                  <th>Appointment Time</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td>
                      <span className="token-badge">#{app.tokenNumber}</span>
                    </td>
                    <td>
                      <strong>{app.patientName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.patientAge} Yrs • {app.patientGender} • <Phone size={12} /> {app.patientPhone}
                      </div>
                    </td>
                    <td>{app.appointmentTime}</td>
                    <td>{app.symptoms || 'General Checkup'}</td>
                    <td><span className={`status-badge status-${app.status}`}>{app.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {app.status === 'PENDING' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')}>
                            Confirm
                          </button>
                        )}
                        {app.status !== 'COMPLETED' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => setConsultingApp(app)}>
                            <FilePlus size={14} /> Prescribe & Complete
                          </button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consultation & Prescription Modal */}
      {consultingApp && (
        <ConsultationModal
          appointment={consultingApp}
          onClose={() => setConsultingApp(null)}
          onSuccess={() => {
            setConsultingApp(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
};
