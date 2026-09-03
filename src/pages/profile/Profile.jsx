import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatDate, getInitials } from '../../utils/helpers';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Logged out', 'You have been signed out.');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-card" style={{ maxWidth: 700 }}>
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {getInitials(user.firstName, user.lastName)}
          </div>
        </div>
        <div className="profile-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted" style={{ marginTop: '0.25rem' }}>{user.email}</p>
            </div>
            <span className={`badge badge-${user.role === 'admin' ? 'active' : user.role === 'manager' ? 'pending' : 'draft'}`}>
              {USER_ROLES[user.role]?.label || user.role}
            </span>
          </div>

          <div className="detail-grid stagger-children" style={{ marginTop: '2rem' }}>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value">{user.department?.name || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Team</span>
              <span className="detail-value">{user.team?.name || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role</span>
              <span className="detail-value">{USER_ROLES[user.role]?.label || user.role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary">✏️ Edit Profile</button>
            <button className="btn btn-secondary">🔒 Change Password</button>
            <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
