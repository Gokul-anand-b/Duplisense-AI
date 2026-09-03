import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!', 'Welcome to DupliSense AI.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-gradient-mesh">
        <div className="bg-orb-3" />
      </div>
      <div className="bg-grid-pattern" />
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">D</div>
          <span className="auth-logo-text text-gradient">DupliSense AI</span>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Get started with DupliSense AI</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-lg)',
                color: '#dc2626',
                fontSize: '0.875rem',
                animation: 'fadeInDown 0.3s ease both',
              }}>
                {error}
              </div>
            )}

            <div className="auth-row">
              <div className="form-group">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input
                  name="firstName"
                  type="text"
                  className="form-input"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input
                  name="lastName"
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account...
                </span>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
