import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../api/services';
import TransactionList from '../components/transactions/TransactionList';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import PassbookImportModal from '../components/transactions/PassbookImportModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Transactions</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {transactions.length} total · <span style={{ color: '#10b981' }}>{fmt(totalIncome)} in</span> · <span style={{ color: '#f43f5e' }}>{fmt(totalExpense)} out</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '10px', padding: '9px 18px',
              fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            📄 Import Passbook
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#3b82f6', color: 'white', border: 'none',
              borderRadius: '10px', padding: '9px 18px',
              fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans',
              cursor: 'pointer',
            }}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['ALL', 'INCOME', 'EXPENSE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filter === f ? '#3b82f6' : 'rgba(255,255,255,0.07)',
              background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: filter === f ? '#3b82f6' : '#64748b',
              fontSize: '13px', fontWeight: '500', fontFamily: 'DM Sans',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expenses'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: '#475569', padding: '40px 0', textAlign: 'center' }}>Loading…</div>
      ) : (
        <TransactionList transactions={filtered} onDeleted={load} />
      )}

      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={load} />
      )}

      {showImport && (
        <PassbookImportModal onClose={() => setShowImport(false)} onSuccess={load} />
      )}
    </div>
  );
}