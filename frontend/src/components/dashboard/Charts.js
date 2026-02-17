import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f43f5e', '#84cc16',
];

const chartDefaults = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#1e2a3a',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      callbacks: {
        label: (ctx) => ` $${Number(ctx.parsed || ctx.raw || 0).toFixed(2)}`,
      },
    },
  },
};

export function IncomeExpensePie({ summary }) {
  const income = Number(summary?.totalIncome || 0);
  const expense = Number(summary?.totalExpense || 0);

  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expense],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(244,63,94,0.8)'],
      borderColor: ['#10b981', '#f43f5e'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>Income vs Expenses</h3>
      {(income + expense) === 0
        ? <Empty />
        : <div style={{ maxWidth: '280px', margin: '0 auto' }}><Pie data={data} options={chartDefaults} /></div>
      }
    </div>
  );
}

export function ExpenseCategoryBar({ summary }) {
  const categories = Object.entries(summary?.expenseByCategory || {});

  const data = {
    labels: categories.map(([k]) => k),
    datasets: [{
      label: 'Expenses by Category',
      data: categories.map(([, v]) => Number(v)),
      backgroundColor: categories.map((_, i) => PALETTE[i % PALETTE.length] + 'bb'),
      borderColor: categories.map((_, i) => PALETTE[i % PALETTE.length]),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Sans' } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#64748b',
          font: { family: 'DM Sans' },
          callback: (v) => `$${v}`,
        },
      },
    },
  };

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>Expenses by Category</h3>
      {categories.length === 0
        ? <Empty />
        : <Bar data={data} options={options} />
      }
    </div>
  );
}

const Empty = () => (
  <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: '13px' }}>
    No data for this month
  </div>
);

const cardStyle = {
  background: '#111827',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
  flex: 1,
  minWidth: '280px',
};

const headerStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#94a3b8',
  margin: '0 0 20px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
