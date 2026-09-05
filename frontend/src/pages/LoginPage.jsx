import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Layers, LogIn, UserPlus, Shield, User, ArrowRight } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('sarah.jenkins@company.com');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('TeamMember');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          fullName,
          email,
          password,
          role,
          jobTitle,
        });
      } else {
        await login(email, password);
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (key) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(key);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      background: 'radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.15), transparent 45%), #0b0f19'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
          marginBottom: 14
        }}>
          <Layers size={30} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Weekly Report Generator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 4 }}>
          Structured work reporting, review workflows & team intelligence
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 420px) minmax(320px, 380px)',
        gap: 24,
        maxWidth: 840,
        width: '100%'
      }}>
        {/* Main Login / Register Card */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: !isRegister ? 'var(--bg-subtle)' : 'transparent',
                color: !isRegister ? '#fff' : 'var(--text-dim)',
                borderBottom: !isRegister ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: isRegister ? 'var(--bg-subtle)' : 'transparent',
                color: isRegister ? '#fff' : 'var(--text-dim)',
                borderBottom: isRegister ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="alert-box alert-warning" style={{ marginBottom: 16 }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="TeamMember">Team Member (Submit Reports)</option>
                    <option value="Manager">Manager / Admin (Review & Dashboard)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title / Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 12 }}
            >
              {loading ? (
                'Processing...'
              ) : isRegister ? (
                <>
                  <UserPlus size={18} />
                  <span>Register Account</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 1-Click Demo Personas Card */}
        <div className="card" style={{ padding: 28, background: 'rgba(21, 30, 46, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Shield size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>1-Click Demo Evaluation</h3>
          </div>
          <p style={{ fontSize: '0.82rem', marginBottom: 16 }}>
            Select any pre-seeded persona to immediately test multi-user roles, review cycles, and team dashboards:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.key}
                onClick={() => handleQuickDemo(demo.key)}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: demo.badgeColor + '25',
                    color: demo.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {demo.role === 'Manager' ? 'M' : 'T'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {demo.label.split(' (')[0]}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {demo.role} • {demo.label.includes('(') ? demo.label.split('(')[1].replace(')', '') : ''}
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-dim)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
