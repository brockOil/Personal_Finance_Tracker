import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(email, password);
      const { token, email: userEmail, userId } = res.data;
      signIn(token, { email: userEmail, userId });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.email || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        <div style={styles.logo}>💰</div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start tracking your finances today</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label className="label">Confirm Password</label>
            <input
              className="input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0f1e',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '40px',
  },
  logo: { fontSize: '32px', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 28px' },
  field: { marginBottom: '16px' },
  error: {
    background: 'rgba(244,63,94,0.1)',
    border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#f43f5e',
    marginBottom: '12px',
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
};
