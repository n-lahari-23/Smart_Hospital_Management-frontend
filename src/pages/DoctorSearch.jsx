import { formatCurrency } from '../utils/currency';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar, Stethoscope, AlertCircle, RefreshCw, X } from 'lucide-react';

export const DoctorSearch = ({ setActivePage, onSelectDoctor }) => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (deptId = '') => {
    setLoading(true);
    setError(null);
    try {
      const [docData, deptData] = await Promise.all([
        api.getDoctors(deptId || null),
        api.getDepartments()
      ]);

      const validDoctors = Array.isArray(docData) ? docData : [];
      const validDepartments = Array.isArray(deptData) ? deptData : [];

      setDoctors(validDoctors);
      if (validDepartments.length > 0) {
        setDepartments(validDepartments);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError(err.message || 'Unable to connect to hospital server. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedDept);
  }, [selectedDept, loadData]);

  const filteredDoctors = (doctors || []).filter(doc => {
    if (!doc) return false;

    // Filter by department if a specific department is selected
    if (selectedDept && String(doc.departmentId) !== String(selectedDept)) {
      return false;
    }

    // Filter by search text (name, specialization, departmentName, qualification)
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const name = (doc.name || '').toLowerCase();
      const spec = (doc.specialization || '').toLowerCase();
      const dept = (doc.departmentName || '').toLowerCase();
      const qual = (doc.qualification || '').toLowerCase();
      return name.includes(term) || spec.includes(term) || dept.includes(term) || qual.includes(term);
    }

    return true;
  });

  const formatHours = (start, end) => {
    if (!start && !end) return '09:00 - 17:00';
    const s = start ? start.substring(0, 5) : '09:00';
    const e = end ? end.substring(0, 5) : '17:00';
    return `${s} - ${e}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Find Medical Specialists</h1>
        <p style={{ color: 'var(--text-muted)' }}>Search and book consultations with leading doctors</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div className="grid grid-2">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search doctor by name, specialization, or qualification..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-control"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards / States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p style={{ fontWeight: 600 }}>Loading specialist availability from hospital network...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: '#fca5a5', background: '#fef2f2' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Unable to Load Doctors</h3>
          <p style={{ color: '#7f1d1d', maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
            {error}
          </p>
          <button
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            onClick={() => loadData(selectedDept)}
          >
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Stethoscope size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem' }}>No doctors found matching criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {(searchTerm || selectedDept)
              ? 'No specialists matched your current filter criteria. Try clearing filters or selecting another department.'
              : 'There are currently no doctors listed in the hospital directory.'}
          </p>
          {(searchTerm || selectedDept) && (
            <button
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
              onClick={() => { setSearchTerm(''); setSelectedDept(''); }}
            >
              <X size={16} /> Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                    {(doc.name || 'D').replace('Dr. ', '').trim().charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)' }}>{doc.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{doc.specialization}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <div><strong>Department:</strong> {doc.departmentName || 'General Medicine'}</div>
                  <div><strong>Qualification:</strong> {doc.qualification || 'MBBS'}</div>
                  <div><strong>Experience:</strong> {doc.experienceYears ? `${doc.experienceYears} Years` : 'Experienced'}</div>
                  <div><strong>Consultation Fee:</strong> {formatCurrency(doc.consultationFee)}</div>
                  <div><strong>Available Days:</strong> {doc.availableDays || 'Monday - Friday'}</div>
                  <div><strong>Hours:</strong> {formatHours(doc.availableTimeStart, doc.availableTimeEnd)}</div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  if (!user) setActivePage('login');
                  else onSelectDoctor(doc);
                }}
              >
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
