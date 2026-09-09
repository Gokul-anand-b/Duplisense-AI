import { useState, useEffect } from 'react';
import { approvalsApi } from '../../services/api';
import { RECOMMENDATION_CATEGORIES, RECOMMENDATION_STATUSES } from '../../utils/constants';

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await approvalsApi.getRecommendations();
        if (Array.isArray(data)) {
          setRecs(data);
        }
      } catch (err) {
        console.warn('Recommendations fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = recs.filter((r) => {
    const matchesStatus = filter === 'all' || r.status === filter;
    const matchesCat = catFilter === 'all' || r.category === catFilter;
    return matchesStatus && matchesCat;
  });

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Reuse Recommendations</h1>
        <p className="page-subtitle">
          AI-generated recommendations for reusing existing project resources
        </p>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="filter-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(RECOMMENDATION_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>
        <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
          {filtered.length} recommendation{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem' }} />
          <h3 className="empty-state-title">Loading Recommendations...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-state-icon">💡</div>
          <h3 className="empty-state-title">No Recommendations Available</h3>
          <p className="empty-state-description">Submit a new proposal to trigger AI reuse analysis.</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((rec) => {
            const cat = RECOMMENDATION_CATEGORIES[rec.category] || { icon: '💻', label: 'Code', class: 'code' };
            const statusStyle = RECOMMENDATION_STATUSES[rec.status] || { label: rec.status, class: 'badge-pending' };
            return (
              <div key={rec.id} className="detail-section">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`rec-category ${cat.class}`}>
                        {cat.icon} {cat.label}
                      </span>
                      <span className={`badge ${statusStyle.class}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f8fafc' }}>{rec.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{rec.description}</p>
                    {rec.evidence && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-tertiary)',
                        borderLeft: '3px solid var(--color-accent-purple)'
                      }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Evidence:</strong> {rec.evidence}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
