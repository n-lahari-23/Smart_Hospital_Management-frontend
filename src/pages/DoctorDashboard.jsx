import React, { useEffect, useState, useContext, useCallback } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, CheckCircle, Clock, FilePlus, Phone, Calendar, Plus, Trash2, Save } from 'lucide-react';
import { ConsultationModal } from './ConsultationModal';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'availability'

  // Appointments / Queue state
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [consultingApp, setConsultingApp] = useState(null);

  // Schedule & Availability state
  const [schedule, setSchedule] = useState({
    availableDays: 'Monday, Tuesday, Wednesday, Thursday, Friday',
    availableTimeStart: '09:00:00',
    availableTimeEnd: '17:00:00',
    maxPatientsPerDay: 30
  });
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState({ text: '', type: '' });

  // Add Leave Form state
  const [newLeave, setNewLeave] = useState({
    unavailableDate: new Date().toISOString().split('T')[0],
    isAllDay: true,
    startTime: '09:00',
    endTime: '13:00',
    reason: ''
  });

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDoctorAppointments(selectedDate);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadScheduleData = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const [schedData, unavailData] = await Promise.all([
        api.getMySchedule(),
        api.getMyUnavailability()
      ]);
      if (schedData) {
        setSchedule({
          availableDays: schedData.availableDays || 'Monday, Tuesday, Wednesday, Thursday, Friday',
          availableTimeStart: schedData.availableTimeStart ? schedData.availableTimeStart.substring(0, 5) : '09:00',
          availableTimeEnd: schedData.availableTimeEnd ? schedData.availableTimeEnd.substring(0, 5) : '17:00',
          maxPatientsPerDay: schedData.maxPatientsPerDay || 30
        });
      }
      setUnavailabilities(Array.isArray(unavailData) ? unavailData : []);
    } catch (err) {
      console.error('Failed to load doctor schedule:', err);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    if (activeTab === 'availability') {
      loadScheduleData();
    }
  }, [activeTab, loadScheduleData]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDayToggle = (day) => {
    const currentDays = schedule.availableDays ? schedule.availableDays.split(',').map(d => d.trim()).filter(Boolean) : [];
    let updated;
    if (currentDays.includes(day)) {
      updated = currentDays.filter(d => d !== day);
    } else {
      updated = [...currentDays, day];
    }
    setSchedule(prev => ({ ...prev, availableDays: updated.join(', ') }));
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleMsg({ text: '', type: '' });
    try {
      let start = schedule.availableTimeStart;
      let end = schedule.availableTimeEnd;
      if (start.length === 5) start += ':00';
      if (end.length === 5) end += ':00';

      await api.updateMySchedule({
        availableDays: schedule.availableDays,
        availableTimeStart: start,
        availableTimeEnd: end,
        maxPatientsPerDay: parseInt(schedule.maxPatientsPerDay, 10) || 30
      });

      setScheduleMsg({ text: 'Working schedule updated successfully! New slots are immediately active.', type: 'success' });
      setTimeout(() => setScheduleMsg({ text: '', type: '' }), 5000);
    } catch (err) {
      setScheduleMsg({ text: err.message || 'Failed to update schedule', type: 'danger' });
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    setScheduleMsg({ text: '', type: '' });
    try {
      let sTime = null;
      let eTime = null;
      if (!newLeave.isAllDay) {
        sTime = newLeave.startTime.length === 5 ? `${newLeave.startTime}:00` : newLeave.startTime;
        eTime = newLeave.endTime.length === 5 ? `${newLeave.endTime}:00` : newLeave.endTime;
      }

      await api.addUnavailability({
        unavailableDate: newLeave.unavailableDate,
        startTime: sTime,
        endTime: eTime,
        reason: newLeave.reason || 'Doctor Leave'
      });

      setScheduleMsg({ text: 'Leave recorded successfully! Patients cannot book during this period.', type: 'success' });
      setNewLeave({
        unavailableDate: new Date().toISOString().split('T')[0],
        isAllDay: true,
        startTime: '09:00',
        endTime: '13:00',
        reason: ''
      });
      loadScheduleData();
      setTimeout(() => setScheduleMsg({ text: '', type: '' }), 5000);
    } catch (err) {
      setScheduleMsg({ text: err.message || 'Failed to add leave', type: 'danger' });
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Delete this leave period and reopen appointment slots for booking?')) return;
    try {
      await api.deleteUnavailability(id);
      loadScheduleData();
    } catch (err) {
      alert(err.message || 'Failed to delete leave');
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Doctor Portal & Practice Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
        </div>

        {activeTab === 'queue' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontWeight: 700 }}>Select Queue Date:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '0.35rem', borderRadius: '12px', width: 'fit-content' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('queue')}
        >
          <Users size={16} /> Patient Live Queue ({appointments.length})
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'availability' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('availability')}
        >
          <Calendar size={16} /> Availability & Schedule
        </button>
      </div>

      {scheduleMsg.text && (
        <div className={`alert alert-${scheduleMsg.type}`} style={{ marginBottom: '1.5rem' }}>
          {scheduleMsg.text}
        </div>
      )}

      {/* TAB 1: QUEUE */}
      {activeTab === 'queue' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card stat-card">
              <div className="stat-icon blue"><Users /></div>
              <div>
                <div className="stat-val">{appointments.length}</div>
                <div className="stat-lbl">Appointments on {selectedDate}</div>
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
        </div>
      )}

      {/* TAB 2: AVAILABILITY & LEAVE MANAGEMENT */}
      {activeTab === 'availability' && (
        <div className="grid grid-2">
          {/* Section 1: Working Schedule Settings */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar className="text-primary" size={20} /> Working Schedule & Hours
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Configure the days and hours you are available at the hospital. Consultation slots are generated within these hours.
            </p>

            {scheduleLoading ? (
              <div>Loading current schedule...</div>
            ) : (
              <form onSubmit={handleSaveSchedule}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                    Practicing Days *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {ALL_DAYS.map(day => {
                      const isSelected = (schedule.availableDays || '').toLowerCase().includes(day.toLowerCase());
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Shift Start Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      required
                      value={schedule.availableTimeStart}
                      onChange={e => setSchedule(prev => ({ ...prev, availableTimeStart: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Shift End Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      required
                      value={schedule.availableTimeEnd}
                      onChange={e => setSchedule(prev => ({ ...prev, availableTimeEnd: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Max Patients Per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-control"
                    value={schedule.maxPatientsPerDay}
                    onChange={e => setSchedule(prev => ({ ...prev, maxPatientsPerDay: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  <Save size={16} /> Save Working Schedule
                </button>
              </form>
            )}
          </div>

          {/* Section 2: Manage Leaves / Unavailability */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Add Leave Form */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus className="text-primary" size={18} /> Schedule Leave or Unavailable Hours
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Slots falling within this date/time will be automatically hidden from patients.
              </p>

              <form onSubmit={handleAddLeave}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Leave Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newLeave.unavailableDate}
                    onChange={e => setNewLeave(prev => ({ ...prev, unavailableDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={newLeave.isAllDay}
                      onChange={e => setNewLeave(prev => ({ ...prev, isAllDay: e.target.checked }))}
                    />
                    Full Day Off / Leave
                  </label>
                </div>

                {!newLeave.isAllDay && (
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={newLeave.startTime}
                        onChange={e => setNewLeave(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={newLeave.endTime}
                        onChange={e => setNewLeave(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>Reason / Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Annual Leave, Surgery, Conference..."
                    value={newLeave.reason}
                    onChange={e => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <Plus size={16} /> Record Leave
                </button>
              </form>
            </div>

            {/* Current Leaves List */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Upcoming Leaves & Blocks ({unavailabilities.length})
              </h3>

              {unavailabilities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No leaves currently scheduled. All regular slots are available.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Period</th>
                        <th>Reason</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unavailabilities.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.unavailableDate}</strong></td>
                          <td>
                            {u.startTime && u.endTime
                              ? `${u.startTime.substring(0, 5)} - ${u.endTime.substring(0, 5)}`
                              : <span style={{ color: '#d97706', fontWeight: 700 }}>All Day</span>}
                          </td>
                          <td>{u.reason || 'Leave'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteLeave(u.id)}
                              title="Delete leave"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
