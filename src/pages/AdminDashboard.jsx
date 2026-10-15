import { formatCurrency } from '../utils/currency';
import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Users, Stethoscope, Calendar, Plus, Trash2, Building, Download, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { StatusDonutChart, TrendBarChart, DepartmentDistributionChart } from '../components/AnalyticsCharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trendDays, setTrendDays] = useState(14);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // New Department Form State
  const [newDept, setNewDept] = useState({ name: '', description: '', icon: 'FaStethoscope' });

  const loadAdminData = useCallback(async () => {
    try {
      const [sData, dData, docData, appData] = await Promise.all([
        api.getAdminStats(),
        api.getDepartments(),
        api.getDoctors(),
        api.getAllAppointments()
      ]);
      setStats(sData);
      setDepartments(Array.isArray(dData) ? dData : []);
      setDoctors(Array.isArray(docData) ? docData : []);
      setAppointments(Array.isArray(appData) ? appData : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }, []);

  const loadAnalytics = useCallback(async (days) => {
    setAnalyticsLoading(true);
    try {
      const aData = await api.getAdminAnalytics(days);
      setAnalytics(aData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    loadAnalytics(trendDays);
  }, [loadAdminData, loadAnalytics, trendDays]);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await api.downloadAppointmentsCsv();
    } catch (err) {
      alert(err.message || 'Failed to download appointment report');
    } finally {
      setExportingCsv(false);
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

  const statusMap = analytics?.statusBreakdown || {
    PENDING: stats?.pendingAppointments || 0,
    CONFIRMED: 0,
    COMPLETED: stats?.completedAppointments || 0,
    CANCELLED: 0
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hospital Administrator Console</h1>
          <p style={{ color: 'var(--text-muted)' }}>Hospital analytics, appointment reports, staff directory, and department settings</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExportCsv}
          disabled={exportingCsv}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <Download size={16} /> {exportingCsv ? 'Exporting Report...' : 'Export Appointments CSV'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '0.35rem', borderRadius: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} /> Analytics & Overview
        </button>
        <button
          className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('departments')}
        >
          <Building size={16} /> Departments ({departments.length})
        </button>
        <button
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={16} /> Doctors Roster ({doctors.length})
        </button>
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={16} /> All Appointments ({appointments.length})
        </button>
      </div>

      {/* OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* High-level KPI Cards */}
          <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="card stat-card">
              <div className="stat-icon blue"><Users /></div>
              <div>
                <div className="stat-val">{stats ? stats.totalPatients : 0}</div>
                <div className="stat-lbl">Registered Patients</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon teal"><Stethoscope /></div>
              <div>
                <div className="stat-val">{stats ? stats.totalDoctors : 0}</div>
                <div className="stat-lbl">Active Doctors</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon purple"><Calendar /></div>
              <div>
                <div className="stat-val">{stats ? stats.totalAppointments : 0}</div>
                <div className="stat-lbl">Total Appointments</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon green"><Building /></div>
              <div>
                <div className="stat-val">{stats ? stats.totalDepartments : 0}</div>
                <div className="stat-lbl">Departments</div>
              </div>
            </div>
          </div>

          {/* Status Breakdown Cards */}
          <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Review</span>
                <Clock size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#b45309' }}>
                {statusMap.PENDING || 0}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #0284c7', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confirmed / Queued</span>
                <Calendar size={16} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#0369a1' }}>
                {statusMap.CONFIRMED || 0}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</span>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#047857' }}>
                {statusMap.COMPLETED || 0}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ef4444', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cancelled Slots</span>
                <XCircle size={16} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#b91c1c' }}>
                {statusMap.CANCELLED || 0}
              </div>
            </div>
          </div>

          {/* Interactive Charts Grid */}
          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            {/* Status Donut Chart */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Appointment Status Distribution
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                Proportion of consultations across all lifecycle stages
              </p>
              <StatusDonutChart statusBreakdown={statusMap} />
            </div>

            {/* Department Distribution Chart */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Department Workload Distribution
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                Consultations and active medical specialists per department
              </p>
              {analytics?.departmentDistribution ? (
                <DepartmentDistributionChart departments={analytics.departmentDistribution} />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading department statistics...
                </div>
              )}
            </div>
          </div>

          {/* Appointment Daily Trends Chart with Filters */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Appointment Volume Trends</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Daily booking activity and patient throughput
                </p>
              </div>

              {/* Date Filters */}
              <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    className={`btn btn-sm ${trendDays === days ? 'btn-primary' : 'btn-outline'}`}
                    style={{ border: 'none', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => setTrendDays(days)}
                  >
                    Last {days} Days
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                Loading trend data...
              </div>
            ) : analytics?.dailyTrends ? (
              <TrendBarChart trends={analytics.dailyTrends} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No trend data available for this range.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={newDept.name}
                  onChange={e => setNewDept({...newDept, name: e.target.value})}
                  placeholder="e.g. Oncology"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={newDept.description}
                  onChange={e => setNewDept({...newDept, description: e.target.value})}
                />
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

      {/* DOCTORS TAB */}
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

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Master Hospital Appointments List</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCsv}
              disabled={exportingCsv}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Fee (INR)</th>
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
                    <td>{formatCurrency(app.consultationFee)}</td>
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
