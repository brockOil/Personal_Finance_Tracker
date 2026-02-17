import React, { useState, useRef } from 'react';
import api from '../../api/client';

export default function PassbookImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type) && !f.name.endsWith('.pdf')) {
      setError('Please upload an image (JPG, PNG) or PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/import/passbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      onSuccess(); // refresh transactions/dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="fade-up">

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Import Passbook</h2>
            <p style={styles.subtitle}>Upload a bank statement screenshot or PDF</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {!result ? (
          <>
            {/* Drop zone */}
            <div
              style={{
                ...styles.dropzone,
                borderColor: dragging ? '#3b82f6' : file ? '#10b981' : 'rgba(255,255,255,0.12)',
                background: dragging ? 'rgba(59,130,246,0.06)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
              />

              {file ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                    {file.type === 'application/pdf' || file.name.endsWith('.pdf') ? '📄' : '🖼️'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    Drop your passbook here
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Supports JPG, PNG, PDF · Max 10MB
                  </div>
                </div>
              )}
            </div>

            {/* Supported formats note */}
            <div style={styles.note}>
              💡 Works with bank statement screenshots, passbook photos, and PDF statements.
              Claude AI will extract all transactions automatically.
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                style={{
                  ...styles.importBtn,
                  opacity: (!file || loading) ? 0.4 : 1,
                  cursor: (!file || loading) ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={styles.spinner} /> Analyzing…
                  </span>
                ) : (
                  '⚡ Import Transactions'
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success screen */
          <div>
            <div style={styles.successBadge}>
              ✅ {result.message}
            </div>

            {result.transactions && result.transactions.length > 0 && (
              <div style={{ marginTop: '16px', maxHeight: '320px', overflowY: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Date', 'Description', 'Category', 'Type', 'Amount'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.transactions.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={styles.td}>{t.date}</td>
                        <td style={{ ...styles.td, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description || '—'}
                        </td>
                        <td style={styles.td}>{t.category}</td>
                        <td style={styles.td}>
                          <span style={{
                            fontSize: '11px', fontWeight: '600',
                            color: t.type === 'INCOME' ? '#10b981' : '#f43f5e',
                            background: t.type === 'INCOME' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                            padding: '2px 8px', borderRadius: '999px',
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{
                          ...styles.td,
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: '600',
                          color: t.type === 'INCOME' ? '#10b981' : '#f43f5e',
                        }}>
                          {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
    backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%', maxWidth: '560px',
    maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px',
  },
  title: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#64748b', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#94a3b8', width: '32px', height: '32px',
    cursor: 'pointer', fontSize: '14px',
  },
  dropzone: {
    border: '2px dashed',
    borderRadius: '14px',
    padding: '40px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  note: {
    fontSize: '12px', color: '#475569',
    background: 'rgba(59,130,246,0.06)',
    border: '1px solid rgba(59,130,246,0.12)',
    borderRadius: '10px', padding: '10px 14px',
    marginBottom: '16px', lineHeight: '1.5',
  },
  error: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '8px', padding: '10px 14px',
    fontSize: '13px', color: '#f43f5e', marginBottom: '12px',
  },
  cancelBtn: {
    flex: '0 0 90px', padding: '12px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#64748b', fontFamily: 'DM Sans',
    fontSize: '14px', cursor: 'pointer',
  },
  importBtn: {
    flex: 1, padding: '12px',
    background: '#3b82f6', border: 'none',
    borderRadius: '10px', color: 'white',
    fontFamily: 'DM Sans', fontSize: '14px', fontWeight: '600',
  },
  spinner: {
    display: 'inline-block',
    width: '14px', height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  successBadge: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '10px', padding: '12px 16px',
    fontSize: '14px', color: '#10b981', fontWeight: '500',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: '13px',
  },
  th: {
    textAlign: 'left', padding: '8px 10px',
    fontSize: '11px', fontWeight: '600', color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  td: {
    padding: '10px', color: '#94a3b8',
  },
};