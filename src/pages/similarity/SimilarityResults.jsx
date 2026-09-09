import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { similarityApi } from '../../services/api';
import { truncate, getSimilarityColor, formatDate } from '../../utils/helpers';
import { SIMILARITY_LEVELS } from '../../utils/constants';

export default function SimilarityResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await similarityApi.getAll();
        if (Array.isArray(data)) {
          setResults(data);
        }
      } catch (err) {
        console.warn('Error loading similarity results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '99px',
          background: 'rgba(124, 58, 237, 0.18)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: '#c4b5fd',
          marginBottom: '0.6rem',
        }}>
          <span>🔍</span> VECTOR SEARCH & AST CODE RESULTS
        </div>
        <h1 className="page-title">Semantic Similarity & Code Scan Results</h1>
        <p className="page-subtitle">
          Real vector comparison results between submitted proposals and baseline completed projects stored in the FAISS Vector DB
        </p>
      </div>

      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
          <h3 className="empty-state-title">Loading Similarity Results from Database...</h3>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            No Proposal Scans Yet
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Submit a new proposal or upload a project report (.docx, .pdf, .txt) on the Submit Proposal page to run a semantic vector search against completed projects.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontWeight: 700 }}>
            ⚡ Go to Submit Proposal →
          </Link>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {results.map((result) => {
            const score = result.similarity_score ?? result.similarityScore ?? 0;
            const level = result.similarity_level ?? result.similarityLevel ?? 'low';
            const matchedTechs = result.matched_technologies ?? result.matchedTechnologies ?? [];
            const isUnlocked = result.is_unlocked || result.approval_status === 'approved';
            const isPending = !isUnlocked && result.approval_status === 'pending';
            const sourceTitle = result.source_project?.title || result.sourceProject?.title || 'Submitted Proposal';
            const similarTitle = result.similar_project?.title || result.similarProject?.title || 'Baseline Project';
            const matchingCodeCount = result.matching_code_count || (result.code_segments ? result.code_segments.length : 0);

            return (
              <Link
                key={result.id}
                to={`/similarity/${result.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="sim-card" style={{
                  border: isUnlocked
                    ? '1px solid rgba(16, 185, 129, 0.45)'
                    : isPending
                    ? '1px solid rgba(245, 158, 11, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isUnlocked
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0.7) 100%)'
                    : 'rgba(15, 23, 42, 0.65)',
                }}>
                  <div className="sim-card-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>{sourceTitle}</span>
                        <span style={{ color: 'var(--color-accent-purple)', fontWeight: 800 }}>↔</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#c4b5fd' }}>{similarTitle}</span>
                      </div>

                      <div className="sim-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span>📅 {result.created_at ? formatDate(result.created_at) : 'Recent Scan'}</span>
                        <span>•</span>
                        <span>🧩 {matchingCodeCount > 0 ? `${matchingCodeCount} AST Code Segments` : 'Architectural Match'}</span>
                        <span>•</span>
                        {/* Lock / Unlock Status Badge */}
                        {isUnlocked ? (
                          <span className="badge badge-approved" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            🔓 Git Access Unlocked
                          </span>
                        ) : isPending ? (
                          <span className="badge badge-pending" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            ⏳ Pending Manager Approval
                          </span>
                        ) : (
                          <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                            🔒 Git Repo Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '90px' }}>
                      <div style={{
                        fontSize: '2.1rem',
                        fontWeight: 900,
                        color: getSimilarityColor(score),
                        lineHeight: 1,
                        textShadow: `0 0 20px ${getSimilarityColor(score)}40`,
                      }}>
                        {score}%
                      </div>
                      <span className={`badge ${SIMILARITY_LEVELS[level]?.bgClass || 'badge-sim-medium'}`} style={{ marginTop: 4, fontSize: '0.7rem' }}>
                        {SIMILARITY_LEVELS[level]?.label || 'Similar'}
                      </span>
                    </div>
                  </div>

                  {matchedTechs.length > 0 && (
                    <div className="sim-card-matches" style={{ marginTop: '0.75rem' }}>
                      {matchedTechs.map((tech) => (
                        <span key={tech} className="tech-tag matched" style={{ fontSize: '0.78rem' }}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="sim-card-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {truncate(result.llm_explanation || result.llmExplanation, 140)}
                    </div>
                    {isUnlocked ? (
                      <span className="btn btn-secondary btn-sm" style={{ flexShrink: 0, marginLeft: '1rem', color: '#34d399', fontWeight: 700 }}>
                        🔓 View Code & Git Repo →
                      </span>
                    ) : isPending ? (
                      <span className="btn btn-secondary btn-sm" style={{ flexShrink: 0, marginLeft: '1rem', color: '#fbbf24', fontWeight: 700 }}>
                        ⏳ Review Pending (Details →)
                      </span>
                    ) : (
                      <span className="btn btn-primary btn-sm" style={{ flexShrink: 0, marginLeft: '1rem', fontWeight: 800 }}>
                        📬 Check Overlap & Request Access →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
