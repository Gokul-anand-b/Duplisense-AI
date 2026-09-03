import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

/**
 * Sidebar navigation component.
 * Shows nav links filtered by user role.
 * Supports collapsed mode and mobile responsive.
 */
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarClass = [
    'sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay visible" onClick={onMobileClose} />
      )}

      <aside className={sidebarClass}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">D</div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">{APP_NAME}</span>
            <span className="sidebar-brand-tagline">{APP_TAGLINE}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => {
            // Filter items by user role
            const visibleItems = section.items.filter(
              (item) => user && item.roles.some((r) => r === user.role || (['user', 'developer'].includes(user.role) && ['user', 'developer'].includes(r)))
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onMobileClose}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-text">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer — User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={logout} title="Click to logout">
            <div className="sidebar-avatar">
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </div>
              <div className="sidebar-user-role">
                {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
