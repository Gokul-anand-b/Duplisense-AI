import { useState, useEffect } from 'react';
import { approvalsApi } from '../../services/api';
import { RECOMMENDATION_CATEGORIES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

export default function ApprovalList() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRecs, setPendingRecs] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const recs = await approvalsApi.getRecommendations();
      if (Array.isArray(recs)) {
        setPendingRecs(recs.filter((r) => r.status === 'pending'));
      }
      const apps = await approvalsApi.getApprovals();
      if (Array.isArray(apps)) {
        setApprovedList(apps);
      }
    } catch (err) {
      console.warn('API fetch warning in ApprovalList:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (rec) => {
    try {
      await approvalsApi.approve(rec.id, {
        notes: 'Admin verified architecture similarity and granted source code access.',
        hours_saved: 160,
      });
      toast.success('Approved!', `"${rec.title}" approved! Source code download is now unlocked for the developer.`);
      loadData();
    } catch (err) {
      toast.error('Approval Error', err.message || 'Failed to approve recommendation.');
    }
  };

  const handleReject = async (rec) => {
    try {
      await approvalsApi.reject(rec.id);
      toast.warning('Rejected', `"${rec.title}" rejected.`);
      loadData();
    } catch (err) {
      toast.error('Rejection Error', err.message || 'Failed to reject recommendation.');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Admin Review & Code Reuse Approvals</h1>
        <p className="page-subtitle">
          Review developer source code reuse requests, approve access, and enable direct source code downloads.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRecs.length})
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved & Verified Savings ({approvedList.length})
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pendingRecs.length > 0 ? pendingRecs.map((rec) => {
            const cat = RECOMMENDATION_CATEGORIES[rec.category] || RECOMMENDATION_CATEGORIES.code;
            return (
              <div key={rec.id} className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className={`rec-category ${cat.class}`}>{cat.icon} {cat.label}</span>
                      <span className="badge badge-pending">Pending Admin Approval</span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>{rec.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                      {rec.description}
                    </p>
                    {rec.evidence && (
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(124, 58, 237, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        borderLeft: '3px solid var(--color-accent-purple)'
                      }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Evidence:</strong> {rec.evidence}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApprove(rec)}
                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      ✅ Approve & Unlock Code Download
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}
                      onClick={() => handleReject(rec)}
                    >
                      ✕ Reject Request
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3 className="empty-state-title">No Pending Requests</h3>
              <p className="empty-state-text">All code reuse requests have been reviewed and resolved.</p>
            </div>
          )}
        </div>
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {approvedList.map((approval) => {
            const rec = approval.recommendation || {};
            const cat = RECOMMENDATION_CATEGORIES[rec.category] || RECOMMENDATION_CATEGORIES.code;
            const reviewerName = approval.reviewer ? `${approval.reviewer.firstName || approval.reviewer.first_name || 'Admin'} ${approval.reviewer.lastName || approval.reviewer.last_name || ''}` : 'Admin';
            
            return (
              <div key={approval.id} className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className={`rec-category ${cat.class}`}>{cat.icon} {cat.label}</span>
                      <span className="badge badge-approved">Approved</span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>{rec.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
                      {rec.description}
                    </p>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>
                      Approved by <strong>{reviewerName}</strong> on {formatDate(approval.reviewedAt || approval.reviewed_at || new Date().toISOString())}
                    </div>

                    {/* Direct Code Download Button */}
                    <a
                      href={approvalsApi.getDownloadUrl(rec.id || approval.id)}
                      download
                      className="btn btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        padding: '0.55rem 1.1rem',
                        textDecoration: 'none',
                        color: '#fff',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <span>⬇️</span> Download Approved Code Package (.ZIP)
                    </a>
                  </div>

                  {/* Savings Calculation Card */}
                  {(approval.savings || approval.savings_details) && (
                    <div style={{
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      textAlign: 'center',
                      animation: 'scaleIn 0.5s ease both',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Verified Cost Saved
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 900, color: '#6ee7b7', margin: '0.25rem 0' }}>
                        {formatCurrency(approval.savings?.costSaved || approval.savings?.cost_saved || 256000)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#a7f3d0', fontWeight: 600 }}>
                        ⏱️ {approval.savings?.hoursSaved || approval.savings?.hours_saved || 160} Development Hours Saved
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
