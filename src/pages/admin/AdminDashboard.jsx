import { useState } from 'react';
import { mockUsers, mockTeams, mockDepartments, mockProjects, mockAnalytics, mockActivityLog } from '../../data/mockData';
import { formatDate, getInitials } from '../../utils/helpers';
import { USER_ROLES } from '../../utils/constants';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage users, teams, departments and view system-wide activity</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'users', 'teams', 'departments', 'activity'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          <div className="admin-stat-grid stagger-children" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: mockUsers.length, icon: '👥', color: 'purple' },
              { label: 'Total Teams', value: mockTeams.length, icon: '🏢', color: 'blue' },
              { label: 'Departments', value: mockDepartments.length, icon: '🏛️', color: 'cyan' },
              { label: 'Total Projects', value: mockProjects.length, icon: '📁', color: 'green' },
              { label: 'Similarities Found', value: mockAnalytics.similarProjectsDetected, icon: '🔍', color: 'orange' },
              { label: 'Active Recommendations', value: mockAnalytics.reuseRecommendations, icon: '💡', color: 'yellow' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-card-header">
                  <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Recent System Activity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {mockActivityLog.map((log, i) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--color-border)',
                    animation: 'fadeInUp 0.4s ease both',
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: log.action.includes('submitted') ? '#7c3aed' :
                      log.action.includes('approved') ? '#8b5cf6' :
                      log.action.includes('rejected') ? '#ef4444' :
                      log.action.includes('registered') ? '#3b82f6' : '#f59e0b',
                    boxShadow: `0 0 8px ${log.action.includes('submitted') ? 'rgba(124, 58, 237, 0.4)' :
                      log.action.includes('approved') ? 'rgba(139, 92, 246, 0.4)' :
                      log.action.includes('rejected') ? 'rgba(239, 68, 68, 0.4)' :
                      log.action.includes('registered') ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.875rem' }}>{log.details}</span>
                  </div>
                  <span className="text-xs text-muted">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="search-bar" style={{ maxWidth: 300 }}>
              <span>🔍</span>
              <input placeholder="Search users..." />
            </div>
            <button className="btn btn-primary">➕ Add User</button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted">{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role === 'admin' ? 'active' : user.role === 'manager' ? 'pending' : 'draft'}`}>
                        {USER_ROLES[user.role].label}
                      </span>
                    </td>
                    <td>{user.department.name}</td>
                    <td>{user.team.name}</td>
                    <td className="text-sm text-muted">{formatDate(user.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm">✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-red)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary">➕ Add Team</button>
          </div>
          <div className="grid-3 stagger-children" style={{ gap: '1rem' }}>
            {mockTeams.map((team) => (
              <div key={team.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{team.name}</h4>
                  <button className="btn btn-ghost btn-sm">✏️</button>
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>{team.description}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  <span>🏛️ {team.department}</span>
                  <span>👥 {team.memberCount} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary">➕ Add Department</button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Teams</th>
                  <th>Members</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDepartments.map((dept) => (
                  <tr key={dept.id}>
                    <td style={{ fontWeight: 600 }}>{dept.name}</td>
                    <td className="text-sm text-muted">{dept.description}</td>
                    <td style={{ fontWeight: 600 }}>{dept.teamCount}</td>
                    <td style={{ fontWeight: 600 }}>{dept.memberCount}</td>
                    <td className="text-sm text-muted">{formatDate(dept.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm">✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-red)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>Entity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mockActivityLog.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`badge badge-${log.action.includes('approved') ? 'approved' : log.action.includes('rejected') ? 'rejected' : log.action.includes('submitted') ? 'active' : 'pending'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{log.details}</td>
                  <td className="text-sm text-muted">{log.entityType}</td>
                  <td className="text-sm text-muted">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
