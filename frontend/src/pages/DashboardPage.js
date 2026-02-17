import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary } from '../api/services';
import SummaryCards from '../components/dashboard/SummaryCards';
import { IncomeExpensePie, ExpenseCategoryBar } from '../components/dashboard/Charts';
import AddTransactionModal from '../components/transactions/AddTransactionModal';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardSummary(year, month);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load summary', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{monthName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Month picker */}
          <select
            className="input"
            style={{ width: 'auto', padding: '9px 12px', fontSize: '13px' }}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className="input"
            style={{ width: 'auto', padding: '9px 12px', fontSize: '13px' }}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#3b82f6', color: 'white', border: 'none',
              borderRadius: '10px', padding: '9px 18px',
              fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#475569', padding: '40px 0', textAlign: 'center' }}>Loading…</div>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <IncomeExpensePie summary={summary} />
            <ExpenseCategoryBar summary={summary} />
          </div>
        </>
      )}

      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={load} />
      )}
    </div>
  );
}
