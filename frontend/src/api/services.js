import api from './client';

// ─── Auth ───────────────────────────────────────────────────────
export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ─── Transactions ────────────────────────────────────────────────
export const getTransactions = () =>
  api.get('/transactions');

export const createTransaction = (data) =>
  api.post('/transactions', data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`);

// ─── Dashboard ───────────────────────────────────────────────────
export const getDashboardSummary = (year, month) => {
  const params = {};
  if (year) params.year = year;
  if (month) params.month = month;
  return api.get('/dashboard/summary', { params });
};
