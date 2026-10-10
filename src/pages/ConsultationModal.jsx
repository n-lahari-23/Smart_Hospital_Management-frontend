import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Plus, Trash2, Save, FileText } from 'lucide-react';

export const ConsultationModal = ({ appointment, onClose, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [items, setItems] = useState([
    { medicineName: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([...items, { medicineName: '', dosage: '', frequency: '1-0-1', duration: '3 days', instructions: 'After meals' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Diagnosis is required');
      return;
    }
    setLoading(true);
    try {
      await api.createPrescription({
        appointmentId: appointment.id,
        diagnosis,
        consultationNotes,
        advice,
        followUpDate: followUpDate || null,
        items
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to record prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <h3>Record Consultation & Prescription (Token #{appointment.tokenNumber})</h3>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          <strong>Patient:</strong> {appointment.patientName} ({appointment.patientAge} Yrs, {appointment.patientGender}) • <strong>Symptoms:</strong> {appointment.symptoms}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Diagnosis / Medical Condition *</label>
            <input type="text" className="form-control" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Acute Bronchitis, Hypertension" />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Consultation Notes</label>
              <textarea className="form-control" rows="2" value={consultationNotes} onChange={e => setConsultationNotes(e.target.value)} placeholder="Clinical observations..." />
            </div>
            <div className="form-group">
              <label>Diet & Lifestyle Advice</label>
              <textarea className="form-control" rows="2" value={advice} onChange={e => setAdvice(e.target.value)} placeholder="Rest, drink fluids, avoid cold water..." />
            </div>
          </div>

          <div className="form-group">
            <label>Follow-up Date (Optional)</label>
            <input type="date" className="form-control" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
          </div>

          {/* Dynamic Medicines List */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Prescribed Medicines</h4>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 40px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input type="text" className="form-control" placeholder="Medicine Name" value={item.medicineName} onChange={e => handleItemChange(idx, 'medicineName', e.target.value)} required />
                <input type="text" className="form-control" placeholder="Dosage (500mg)" value={item.dosage} onChange={e => handleItemChange(idx, 'dosage', e.target.value)} required />
                <input type="text" className="form-control" placeholder="Freq (1-0-1)" value={item.frequency} onChange={e => handleItemChange(idx, 'frequency', e.target.value)} required />
                <input type="text" className="form-control" placeholder="Duration" value={item.duration} onChange={e => handleItemChange(idx, 'duration', e.target.value)} required />
                <input type="text" className="form-control" placeholder="Instructions" value={item.instructions} onChange={e => handleItemChange(idx, 'instructions', e.target.value)} />
                {items.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" style={{ padding: '0.5rem' }} onClick={() => handleRemoveItem(idx)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving Prescription...' : 'Complete Consultation & Issue Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};
