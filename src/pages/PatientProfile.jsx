import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Save } from 'lucide-react';

export const PatientProfile = () => {
  const [profile, setProfile] = useState({ name: '', phone: '', age: '', gender: 'Male', bloodGroup: 'O+', address: '', emergencyContact: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getPatientProfile().then(res => {
      setProfile({
        name: res.name || '',
        phone: res.phone || '',
        age: res.age || '',
        gender: res.gender || 'Male',
        bloodGroup: res.bloodGroup || 'O+',
        address: res.address || '',
        emergencyContact: res.emergencyContact || ''
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.updatePatientProfile(profile);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User className="text-primary" /> Patient Medical Profile
        </h2>

        {msg && <div className="alert alert-success">{msg}</div>}

        {loading ? <div>Loading profile data...</div> : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-3">
              <div className="form-group">
                <label>Age</label>
                <input type="number" className="form-control" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-control" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select className="form-control" value={profile.bloodGroup} onChange={e => setProfile({...profile, bloodGroup: e.target.value})}>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Home Address (City, State, PIN)</label>
              <input type="text" className="form-control" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="e.g. Plot 42, Jubilee Hills, Hyderabad, Telangana 500033" />
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <input type="text" className="form-control" value={profile.emergencyContact} onChange={e => setProfile({...profile, emergencyContact: e.target.value})} placeholder="e.g. +91 98765 43210" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
