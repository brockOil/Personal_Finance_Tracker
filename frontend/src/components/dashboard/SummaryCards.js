import React from 'react';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '22px 24px',
      flex: 1,
      minWidth: '180px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            {label}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color, letterSpacing: '-0.02em', fontFamily: 'JetBrains Mono, monospace' }}>
            {fmt(value)}
          </div>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <StatCard label="Total Income" value={summary?.totalIncome} color="#10b981" icon="↑" />
      <StatCard label="Total Expenses" value={summary?.totalExpense} color="#f43f5e" icon="↓" />
      <StatCard
        label="Balance"
        value={summary?.balance}
        color={summary?.balance >= 0 ? '#3b82f6' : '#f43f5e'}
        icon="≈"
      />
    </div>
  );
}
