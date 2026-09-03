import { useState } from 'react';
import { mockRecommendations } from '../../data/mockData';
import { RECOMMENDATION_CATEGORIES, RECOMMENDATION_STATUSES } from '../../utils/constants';
import { truncate } from '../../utils/helpers';

export default function Recommendations() {
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = mockRecommendations.filter((r) => {
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

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((rec) => {
          const cat = RECOMMENDATION_CATEGORIES[rec.category];
          return (
            <div key={rec.id} className="detail-section">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`rec-category ${cat.class}`}>
                      {cat.icon} {cat.label}
                    </span>
                    <span className={`badge ${RECOMMENDATION_STATUSES[rec.status].class}`}>
                      {RECOMMENDATION_STATUSES[rec.status].label}
                    </span>
                    <span className="text-xs text-muted">
                      from: {rec.similarityResult.sourceProject.title} ↔ {rec.similarityResult.similarProject.title}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {rec.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    {rec.description}
                  </p>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    borderLeft: '3px solid var(--color-accent-purple)',
                  }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Evidence:</strong> {rec.evidence}
                  </div>
                </div>
                {rec.status === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn btn-success btn-sm">✅ Approve</button>
                    <button className="btn btn-danger btn-sm">✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💡</div>
            <h3 className="empty-state-title">No recommendations found</h3>
            <p className="empty-state-text">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
