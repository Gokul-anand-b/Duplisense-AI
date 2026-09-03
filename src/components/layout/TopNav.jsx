import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

/**
 * Top navigation bar with breadcrumb, search, and quick actions.
 */
export default function TopNav({ collapsed, onToggle, onMobileMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  // Generate breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((segment, i) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
    isLast: i === pathSegments.length - 1,
  }));

  return (
    <header className={`topnav ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topnav-left">
        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={onMobileMenuToggle}>
          ☰
        </button>

        {/* Desktop sidebar toggle with Apple-style smooth rotation */}
        <button className="topnav-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <span style={{
            display: 'inline-block',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.9rem'
          }}>
            ◀
          </span>
        </button>

        {/* Breadcrumb */}
        <div className="topnav-breadcrumb">
          <Link to="/dashboard" style={{ color: 'inherit' }}>Home</Link>
          {breadcrumb.map((item) => (
            <span key={item.path}>
              <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
              {item.isLast ? (
                <span className="topnav-breadcrumb-active">{item.label}</span>
              ) : (
                <Link to={item.path} style={{ color: 'inherit' }}>{item.label}</Link>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="topnav-right">
        {/* Search */}
        <div className="topnav-search">
          <span className="topnav-search-icon">🔍</span>
          <input type="text" placeholder="Search projects, teams..." />
        </div>

        {/* Notification bell */}
        <button className="topnav-icon-btn" title="Notifications">
          🔔
          <span className="badge"></span>
        </button>

        {/* User avatar */}
        <Link to="/profile" className="topnav-icon-btn" title="Profile">
          <div
            className="sidebar-avatar"
            style={{ width: 32, height: 32, fontSize: '0.7rem' }}
          >
            {user ? getInitials(user.firstName, user.lastName) : '?'}
          </div>
        </Link>
      </div>
    </header>
  );
}
