import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockUsers, mockTeams, mockDepartments, mockProjects, mockAnalytics, mockActivityLog } from '../../data/mockData';
import { formatDate, getInitials } from '../../utils/helpers';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export default function AdminDashboardView({ user }) {
  const toast = useToast();
  const [reindexing, setReindexing] = useState(false);

  const handleReindex = () => {
    setReindexing(true);
    toast.info('Vector Indexing', 'Re-computing 768-dim embeddings across 42 repositories...');
    setTimeout(() => {
      setReindexing(false);
      toast.success('FAISS Vector Index Synced', '18,450 vector embeddings updated in 420ms.');
    }, 1800);
  };

  const vectorStats = [
    { label: 'Indexed Embeddings', value: '18,450', sub: '768-dim Dense Vectors', icon: '🧠', color: 'purple' },
    { label: 'FAISS Search Latency', value: '14.2 ms', sub: 'Average Cosine Match', icon: '⚡', color: 'cyan' },
    { label: 'Active Enterprise Repos', value: '42 Repos', sub: 'Git & Confluence synced', icon: '📁', color: 'blue' },
    { label: 'Cache Hit Ratio', value: '94.8%', sub: 'Redis Distributed Cache', icon: '💎', color: 'teal' },
  ];

  return (
    <div className="page-enter">
      {/* Admin Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '2.5rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(16, 14, 30, 0.92) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#c4b5fd',
              marginBottom: '0.75rem',
            }}>
              <span>🛡️</span> SYSTEM GOVERNANCE & AI VECTOR CONTROL
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: '#f8fafc' }}>
              System Control, <span className="text-gradient-cyber">{user?.firstName || 'Admin'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
              Manage organization users, monitor FAISS vector indexing pipeline, and audit security & duplicate detection activity.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReindex}
              disabled={reindexing}
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}
            >
              {reindexing ? '⏳ Re-indexing Vector DB...' : '🔄 Re-index FAISS Embeddings'}
            </button>
            <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.85rem 1.4rem' }}>
              👥 User Management
            </Link>
          </div>
        </div>
      </div>

      {/* Vector Engine Health Metrics */}
      <div className="stagger-children" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {vectorStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-card-header">
              <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
              <span className="badge badge-active">Live</span>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2.1rem' }}>{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Vector DB Status & Security Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* User Management Quick Overview */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                👥 Enterprise Users & Role Access Matrix
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {mockUsers.length} registered accounts across {mockDepartments.length} engineering divisions
              </p>
            </div>
            <Link to="/admin" className="btn btn-secondary btn-sm">Full User Directory →</Link>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.slice(0, 5).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sidebar-avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>
                          {getInitials(u.firstName, u.lastName)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'active' : u.role === 'manager' ? 'pending' : 'draft'}`}>
                        {USER_ROLES[u.role].label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{u.department.name}</td>
                    <td><span className="badge badge-approved">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time System Audit Stream */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              📜 Ingestion & Audit Stream
            </h3>
            <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>Live Stream</span>
          </div>

          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mockActivityLog.slice(0, 5).map((log, idx) => (
              <div
                key={log.id || idx}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: '#8b5cf6',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: '#f8fafc', fontWeight: 500 }}>{log.details}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.15rem' }}>
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
