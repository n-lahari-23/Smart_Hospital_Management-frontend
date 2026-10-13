import { formatCurrency } from '../utils/currency';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Shield, Users, Stethoscope, Calendar, Plus, Trash2, Building } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // New Department Form State
  const [newDept, setNewDept] = useState({ name: '', description: '', icon: 'FaStethoscope' });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [sData, dData, docData, appData] = await Promise.all([
        api.getAdminStats(),
        api.getDepartments(),
        api.getDoctors(),
        api.getAllAppointments()
      ]);
      setStats(sData);
      setDepartments(dData);
      setDoctors(docData);
      setAppointments(appData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.createDepartment(newDept);
      setNewDept({ name: '', description: '', icon: 'FaStethoscope' });
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Delete department?')) return;
    try {
      await api.deleteDepartment(id);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hospital Administrator Console</h1>
        <p style={{ color: 'var(--text-muted)' }}>Hospital analytics, staff directory, and department settings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '0.35rem', borderRadius: '12px' }}>
        <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }} onClick={() => setActiveTab('overview')}>
          Overview Stats
        </button>
        <button className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }} onClick={() => setActiveTab('departments')}>
          Departments
        </button>
        <button className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }} onClick={() => setActiveTab('doctors')}>
          Doctors Roster ({doctors.length})
        </button>
        <button className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }} onClick={() => setActiveTab('appointments')}>
          All Appointments ({appointments.length})
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card stat-card">
              <div className="stat-icon blue"><Users /></div>
              <div>
                <div className="stat-val">{stats.totalPatients}</div>
                <div className="stat-lbl">Total Patients</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon teal"><Stethoscope /></div>
              <div>
                <div className="stat-val">{stats.totalDoctors}</div>
                <div className="stat-lbl">Active Doctors</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon purple"><Calendar /></div>
              <div>
                <div className="stat-val">{stats.totalAppointments}</div>
                <div className="stat-lbl">Total Appointments</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon green"><Building /></div>
              <div>
                <div className="stat-val">{stats.totalDepartments}</div>
                <div className="stat-lbl">Departments</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="form-group">
                <label>Department Name</label>
                <input type="text" className="form-control" required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} placeholder="e.g. Oncology" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Create Department
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Hospital Departments</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.description}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDepartment(d.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Medical Staff Directory</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee (INR)</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td><strong>{doc.name}</strong></td>
                    <td>{doc.departmentName || 'N/A'}</td>
                    <td>{doc.specialization}</td>
                    <td>{doc.experienceYears} Yrs</td>
                    <td>{formatCurrency(doc.consultationFee)}</td>
                    <td>{doc.availableDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Master Hospital Appointments List</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td><span className="token-badge">#{app.tokenNumber}</span></td>
                    <td>{app.patientName}</td>
                    <td>{app.doctorName}</td>
                    <td>{app.appointmentDate} at {app.appointmentTime}</td>
                    <td><span className={`status-badge status-${app.status}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
