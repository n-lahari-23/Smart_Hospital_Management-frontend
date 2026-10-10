import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar, Award, Clock, DollarSign, Stethoscope, CheckCircle2 } from 'lucide-react';

export const DoctorSearch = ({ setActivePage, onSelectDoctor }) => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docData, deptData] = await Promise.all([
        api.getDoctors(selectedDept || null),
        api.getDepartments()
      ]);
      setDoctors(docData);
      setDepartments(deptData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search doctor by name or specialization..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select className="form-control" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading doctor availability...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Stethoscope size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No doctors found matching criteria</h3>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)' }}>{doc.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{doc.specialization}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <div><strong>Department:</strong> {doc.departmentName || 'General'}</div>
                  <div><strong>Qualification:</strong> {doc.qualification}</div>
                  <div><strong>Experience:</strong> {doc.experienceYears} Years</div>
                  <div><strong>Consultation Fee:</strong> ${doc.consultationFee}</div>
                  <div><strong>Available Days:</strong> {doc.availableDays}</div>
                  <div><strong>Hours:</strong> {doc.availableTimeStart} - {doc.availableTimeEnd}</div>
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
