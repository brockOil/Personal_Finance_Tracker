import React, { useState } from 'react';
import { createTransaction } from '../../api/services';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'];
const EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transport', 'Entertainment', 'Healthcare',
  'Education', 'Shopping', 'Utilities', 'Insurance', 'Other'
];

export default function AddTransactionModal({ onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: today,
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, category: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Please select a category'); return; }
    setError('');
    setLoading(true);
    try {
      await createTransaction({ ...form, amount: parseFloat(form.amount) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="fade-up">
        <div style={styles.header}>
          <h2 style={styles.title}>Add Transaction</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Type Toggle */}
        <div style={styles.typeToggle}>
          {['EXPENSE', 'INCOME'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              style={{
                ...styles.typeBtn,
                background: form.type === type
                  ? (type === 'INCOME' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)')
                  : 'transparent',
                color: form.type === type
                  ? (type === 'INCOME' ? '#10b981' : '#f43f5e')
                  : '#64748b',
                border: `1px solid ${form.type === type
                  ? (type === 'INCOME' ? '#10b981' : '#f43f5e')
                  : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {type === 'INCOME' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div>
              <label className="label">Amount ($)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set('amount')}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={set('date')}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')} required>
              <option value="">Select a category…</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input
              className="input"
              type="text"
              placeholder="What was this for?"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Adding…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%', maxWidth: '480px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#94a3b8', width: '32px', height: '32px',
    cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  typeToggle: { display: 'flex', gap: '10px', marginBottom: '20px' },
  typeBtn: {
    flex: 1, padding: '10px', borderRadius: '10px',
    fontFamily: 'DM Sans', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  error: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f43f5e', marginBottom: '12px',
  },
  cancelBtn: {
    flex: '0 0 100px', padding: '12px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#64748b', fontFamily: 'DM Sans', fontSize: '14px', cursor: 'pointer',
  },
};
