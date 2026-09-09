import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRoleLoading, setActiveRoleLoading] = useState(null);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRoleLogin = async (roleEmail, roleName) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
    setActiveRoleLoading(roleName);
    try {
      await login(roleEmail, 'password123');
      toast.success(`Welcome, ${roleName}`, `Signed into your enterprise ${roleName} workspace.`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check backend server.');
    } finally {
      setActiveRoleLoading(null);
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
      toast.success('Welcome back!', `Signed in as ${user.firstName || user.role}.`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        position: 'relative',
        background: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Background Animated Ambient Grid & Light Sweep */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 35%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 35%, black 40%, transparent 80%)',
        }}
      />

      {/* Floating Ambient White Radiance */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: '1180px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 1.15rem',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.04em',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span>✦</span> ENTERPRISE CODE INTELLIGENCE & REUSE GOVERNANCE
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.2rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              margin: '0 0 0.6rem 0',
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            DupliSense <span style={{ color: '#ffffff', borderBottom: '3px solid #ffffff' }}>AI</span>
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.05rem',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Eliminate redundant engineering. Select your organizational role below to access your dedicated workflow, or authenticate with custom credentials.
          </p>
        </div>

        {/* 3 Dedicated Role Selector Cards (Monochrome Bold) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Developer Role */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              background: '#0e0e11',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.85)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  💻
                </div>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 700,
                  }}
                >
                  Developer
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Developer Workspace
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.55, marginBottom: '1.4rem' }}>
                Upload proposal documents to auto-extract technical specifications, run vector searches against existing baseline systems, and request repository access.
              </p>

              <div style={{ fontSize: '0.82rem', color: '#e4e4e7', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Document upload (PDF, DOCX, TXT)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> 3-Layer auto-extraction pipeline
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> FAISS 512-dim Vector search
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Request Git repository unlock
                </div>
              </div>
            </div>

            <button
              type="button"
              id="login-developer-btn"
              className="btn btn-primary"
              disabled={activeRoleLoading !== null || loading}
              onClick={() => handleRoleLogin('dev@duplisense.ai', 'Developer')}
              style={{
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {activeRoleLoading === 'Developer' ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#000000' }} />
                  <span>Entering Workspace...</span>
                </>
              ) : (
                <>
                  <span>💻</span> Enter Developer Portal →
                </>
              )}
            </button>
          </div>

          {/* Card 2: Manager Role */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              background: '#0e0e11',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.85)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  👔
                </div>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 700,
                  }}
                >
                  Project Manager
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Manager Portal
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.55, marginBottom: '1.4rem' }}>
                Ingest completed enterprise projects into the FAISS vector database. Review developer repository reuse applications and unlock Git access.
              </p>

              <div style={{ fontSize: '0.82rem', color: '#e4e4e7', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Ingest completed code & documentation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Live vector database indexing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Review incoming reuse requests
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> 1-Click Git access unlocking
                </div>
              </div>
            </div>

            <button
              type="button"
              id="login-manager-btn"
              className="btn btn-primary"
              disabled={activeRoleLoading !== null || loading}
              onClick={() => handleRoleLogin('manager@duplisense.ai', 'Engineering Manager')}
              style={{
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {activeRoleLoading === 'Engineering Manager' ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#000000' }} />
                  <span>Entering Portal...</span>
                </>
              ) : (
                <>
                  <span>👔</span> Enter Manager Portal →
                </>
              )}
            </button>
          </div>

          {/* Card 3: Admin Role */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              background: '#0e0e11',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.85)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  🛡️
                </div>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 700,
                  }}
                >
                  Compliance Admin
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Admin Analytics
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.55, marginBottom: '1.4rem' }}>
                Enterprise analytics dashboard tracking hours saved, duplication rates, monetary ROI, vector index integrity, and audit governance.
              </p>

              <div style={{ fontSize: '0.82rem', color: '#e4e4e7', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Real engineering hours preserved
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Monetary ROI & cost savings tracking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> Cross-team reuse efficiency rate
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>✓</span> FAISS vector index status & health
                </div>
              </div>
            </div>

            <button
              type="button"
              id="login-admin-btn"
              className="btn btn-primary"
              disabled={activeRoleLoading !== null || loading}
              onClick={() => handleRoleLogin('admin@duplisense.ai', 'Admin')}
              style={{
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {activeRoleLoading === 'Admin' ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#000000' }} />
                  <span>Entering Panel...</span>
                </>
              ) : (
                <>
                  <span>🛡️</span> Enter Admin Panel →
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Credentials Form (Obsidian Dark Glass) */}
        <div
          className="glass-card"
          style={{
            padding: '2.25rem',
            maxWidth: '520px',
            margin: '0 auto',
            background: '#0a0a0d',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
              Sign In with Custom Credentials
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: 0 }}>
              Or click a demo role to prefill credentials instantly:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setEmail('dev@duplisense.ai'); setPassword('password123'); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '99px',
                  cursor: 'pointer',
                }}
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => { setEmail('manager@duplisense.ai'); setPassword('password123'); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '99px',
                  cursor: 'pointer',
                }}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => { setEmail('admin@duplisense.ai'); setPassword('password123'); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '99px',
                  cursor: 'pointer',
                }}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="dev@duplisense.ai, manager@duplisense.ai..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary w-full"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                padding: '0.8rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.82rem',
              color: '#71717a',
            }}
          >
            Need a new account?{' '}
            <Link to="/register" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
