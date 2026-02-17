import React from 'react';
import { deleteTransaction } from '../../api/services';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function TransactionList({ transactions, onDeleted }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      onDeleted();
    } catch {
      alert('Failed to delete transaction');
    }
  };

  if (!transactions?.length) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
        <div style={{ color: '#475569', fontSize: '14px' }}>No transactions yet. Add your first one!</div>
      </div>
    );
  }

  return (
    <div>
      {transactions.map((t, i) => (
        <div
          key={t.id}
          style={{
            ...styles.row,
            animationDelay: `${i * 0.04}s`,
          }}
          className="fade-up"
        >
          {/* Icon */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            background: t.type === 'INCOME' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>
            {t.type === 'INCOME' ? '↑' : '↓'}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9', marginBottom: '2px' }}>
              {t.description || t.category}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={styles.badge}>{t.category}</span>
              <span style={{ fontSize: '12px', color: '#475569' }}>{fmtDate(t.date)}</span>
            </div>
          </div>

          {/* Amount */}
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            fontFamily: 'JetBrains Mono, monospace',
            color: t.type === 'INCOME' ? '#10b981' : '#f43f5e',
          }}>
            {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
          </div>

          {/* Delete */}
          <button
            onClick={() => handleDelete(t.id)}
            style={styles.deleteBtn}
            title="Delete"
            onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '6px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.15s',
    cursor: 'default',
  },
  badge: {
    fontSize: '11px', fontWeight: '500', color: '#475569',
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 8px', borderRadius: '999px',
  },
  deleteBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#475569', padding: '4px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '16px',
  },
};
