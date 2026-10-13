import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus } from 'lucide-react';

export const Register = ({ setActivePage }) => {
  const { register } = useContext(AuthContext);
  const [role, setRole] = useState('PATIENT');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', gender: 'Male', bloodGroup: 'O+', address: '', emergencyContact: '',
    departmentId: '', specialization: '', qualification: '', experienceYears: '', consultationFee: 500
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDepartments()
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData, role };
      if (role === 'DOCTOR' && !payload.departmentId && departments.length > 0) {
        payload.departmentId = departments[0].id;
      }
      const user = await register(payload);
      if (user.role === 'PATIENT') setActivePage('my-appointments');
      else if (user.role === 'DOCTOR') setActivePage('doctor-dashboard');
      else setActivePage('home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--teal-light)', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Smart Hospital System</p>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
            <button
              type="button"
              className={`btn ${role === 'PATIENT' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none' }}
              onClick={() => setRole('PATIENT')}
            >
              Patient Registration
            </button>
            <button
              type="button"
              className={`btn ${role === 'DOCTOR' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none' }}
              onClick={() => setRole('DOCTOR')}
            >
              Doctor Registration
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} placeholder="e.g. Aarav Sharma" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} placeholder="aarav@example.com" />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" name="phone" className="form-control" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>

          {role === 'PATIENT' ? (
            <>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} placeholder="30" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address (City, State, PIN)</label>
                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} placeholder="e.g. Plot 42, Jubilee Hills, Hyderabad, Telangana 500033" />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input type="text" name="emergencyContact" className="form-control" value={formData.emergencyContact} onChange={handleChange} placeholder="e.g. +91 98765 43211" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Department</label>
                  <select name="departmentId" className="form-control" value={formData.departmentId} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" />
                </div>
              </div>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Qualification</label>
                  <input type="text" name="qualification" className="form-control" value={formData.qualification} onChange={handleChange} placeholder="MD, MBBS, AIIMS" />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experienceYears" className="form-control" value={formData.experienceYears} onChange={handleChange} placeholder="10" />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹ / INR)</label>
                  <input type="number" name="consultationFee" className="form-control" value={formData.consultationFee} onChange={handleChange} placeholder="800" />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
