import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRoleLogin = async (roleEmail, roleName) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login(roleEmail, 'password123');
      toast.success(`Logged in as ${roleName}`, `Welcome to your tailored ${roleName} portal.`);
      navigate(roleName === 'Developer' ? '/submit' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!', `Signed in as ${user.firstName || 'User'}.`);
      navigate(user.role === 'admin' ? '/dashboard' : '/submit');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      {/* Background Ambience */}
      <div className="bg-gradient-mesh">
        <div className="bg-orb-1" style={{ top: '10%', left: '20%' }} />
        <div className="bg-orb-3" style={{ bottom: '15%', right: '20%' }} />
      </div>
      <div className="bg-grid-pattern" />

      <div style={{ maxWidth: '880px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header Branding (No Topbar) */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 1rem',
            borderRadius: '99px',
            background: 'rgba(124, 58, 237, 0.18)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: '#c4b5fd',
            marginBottom: '1rem',
          }}>
            <span>✦</span> AI DUPLICATE DETECTION & CODE REUSE PLATFORM
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            margin: '0 0 0.5rem 0',
            color: '#f8fafc',
          }}>
            DupliSense <span className="text-gradient">AI</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', margin: 0 }}>
            Select your role to access your dedicated workflow
          </p>
        </div>

        {/* Dual Role Selector Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Card 1: Developer Role */}
          <div className="glass-card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(6, 95, 70, 0.25) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.2s, border-color 0.2s',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  💻
                </div>
                <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: '#059669' }}>
                  Developer Role
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                Developer Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Enter new project specifications or upload proposal reports (PDF/DOCX). The FAISS vector engine checks against all stored projects, detects overlapping code, and allows requesting approved source code downloads.
              </p>

              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Enter specs or upload PDF/DOCX report
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Run FAISS vector database similarity scan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Request code access from Admin
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Download approved source code ZIP
                </div>
              </div>
            </div>

            <button
              type="button"
              id="login-developer-btn"
              className="btn btn-primary"
              disabled={loading}
              onClick={() => handleRoleLogin('dev@duplisense.ai', 'Developer')}
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>💻</span> Enter as Developer →
            </button>
          </div>

          {/* Card 2: Admin Role */}
          <div className="glass-card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.2s, border-color 0.2s',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  🛡️
                </div>
                <span className="badge badge-active" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c4b5fd', borderColor: '#7c3aed' }}>
                  Admin / Manager Role
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                Admin & Approvals Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Ingest completed enterprise projects (PDF/ZIP/folder of any stack), review developer source code reuse requests, approve access, and track verified development cost savings (ROI).
              </p>

              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#c4b5fd' }}>✓</span> Upload completed project archives & codebases
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#c4b5fd' }}>✓</span> Review incoming developer code reuse requests
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#c4b5fd' }}>✓</span> 1-Click Approve or Reject requests
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#c4b5fd' }}>✓</span> Monitor engineering hours saved & ROI metrics
                </div>
              </div>
            </div>

            <button
              type="button"
              id="login-admin-btn"
              className="btn btn-primary"
              disabled={loading}
              onClick={() => handleRoleLogin('admin@duplisense.ai', 'Admin')}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🛡️</span> Enter as Admin →
            </button>
          </div>
        </div>

        {/* Custom Credentials Accordion / Form */}
        <div className="glass-card" style={{
          padding: '1.75rem',
          maxWidth: '520px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem', textAlign: 'center' }}>
            Or Sign In with Custom Email
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '1.25rem' }}>
            Enter your organization credentials below
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="developer@duplisense.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary w-full"
              disabled={loading}
              style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            Need a new account? <Link to="/register" style={{ color: '#c4b5fd', fontWeight: 600 }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
