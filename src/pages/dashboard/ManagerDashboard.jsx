import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAnalytics, mockRecommendations, mockApprovals, mockTeams } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { RECOMMENDATION_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

export default function ManagerDashboard({ user }) {
  const toast = useToast();
  const data = mockAnalytics;
  const pendingRecs = mockRecommendations.filter(r => r.status === 'pending');

  const teamPerformance = [
    { team: 'Platform Engineering', reuseRate: '82%', hoursSaved: 840, costSaved: '₹13,44,000' },
    { team: 'AI / ML Core', reuseRate: '75%', hoursSaved: 680, costSaved: '₹10,88,000' },
    { team: 'Fintech Operations', reuseRate: '68%', hoursSaved: 520, costSaved: '₹8,32,000' },
    { team: 'Mobile & Web UI', reuseRate: '60%', hoursSaved: 360, costSaved: '₹5,76,000' },
  ];

  return (
    <div className="page-enter">
      {/* Manager Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '2.5rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(99, 102, 241, 0.14) 50%, rgba(16, 14, 30, 0.9) 100%)',
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
              <span>👔</span> ENGINEERING MANAGEMENT & SAVINGS PORTAL
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Management Portal, <span className="text-gradient-cyber">{user?.firstName || 'Manager'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
              Track organization-wide ROI, approve cross-team reuse proposals, and verify engineering budget preservation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/approvals" className="btn btn-primary" style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}>
              📋 Review Pending Approvals ({pendingRecs.length})
            </Link>
            <Link to="/analytics" className="btn btn-secondary" style={{ padding: '0.85rem 1.4rem' }}>
              📈 Financial ROI Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Manager Stat Cards */}
      <div className="stagger-children" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">📋</div>
            <span className="badge badge-pending">Action Req</span>
          </div>
          <div className="stat-card-value">{pendingRecs.length}</div>
          <div className="stat-card-label">Pending Reuse Approvals</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon teal">💎</div>
            <span className="badge badge-approved">+22% YoY</span>
          </div>
          <div className="stat-card-value">{formatCurrency(data.totalCostSaved)}</div>
          <div className="stat-card-label">Verified Cost Saved</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">⏱️</div>
            <span className="badge badge-sim-partial">2,400 hrs</span>
          </div>
          <div className="stat-card-value">{data.totalHoursSaved}</div>
          <div className="stat-card-label">Total Dev Hours Saved</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">⚡</div>
            <span className="badge badge-active">High</span>
          </div>
          <div className="stat-card-value">68%</div>
          <div className="stat-card-label">Team Reuse Efficiency Rate</div>
        </div>
      </div>

      {/* Actionable Pending Approvals Box */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              ⚡ Pending Manager Decision Pipeline
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Evaluate cross-team duplicate detections and lock in verified engineering savings
            </p>
          </div>
          <Link to="/approvals" className="btn btn-secondary btn-sm">Full Approval Portal →</Link>
        </div>

        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingRecs.map((rec) => {
            const cat = RECOMMENDATION_CATEGORIES[rec.category];
            return (
              <div
                key={rec.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
                className="glass-card"
              >
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className={`rec-category ${cat.class}`}>{cat.icon} {cat.label}</span>
                    <span className="badge badge-pending">Requires Approval</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>{rec.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{rec.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => toast.success('Approved!', `"${rec.title}" recommendation approved.`)}
                  >
                    ✅ Approve Reuse
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                    onClick={() => toast.warning('Rejected', `"${rec.title}" rejected.`)}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Leaderboard & Monthly Savings Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Team Leaderboard */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
            👥 Team Reuse Performance Leaderboard
          </h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Reuse Rate</th>
                  <th>Hours Saved</th>
                  <th>Cost Saved</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((t, idx) => (
                  <tr key={t.team}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                      <span style={{ color: '#c4b5fd', marginRight: '0.5rem', fontFamily: 'var(--font-mono)' }}>#{idx + 1}</span>
                      {t.team}
                    </td>
                    <td><span className="badge badge-active">{t.reuseRate}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{t.hoursSaved} hrs</td>
                    <td style={{ fontWeight: 700, color: '#c4b5fd', fontFamily: 'var(--font-mono)' }}>{t.costSaved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Savings Velocity */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
            📈 Monthly Reuse Savings Velocity
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.savingsByCategory.filter(c => c.hoursSaved > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0e0c1e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#f8fafc' }} />
              <Bar dataKey="hoursSaved" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Hours Saved" />
              <Bar dataKey="costSaved" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cost Saved (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
