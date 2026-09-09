import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { similarityApi, approvalsApi } from '../../services/api';
import { getSimilarityColor, formatDate } from '../../utils/helpers';
import { SIMILARITY_LEVELS } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export default function SimilarityDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reuseRequest, setReuseRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [expandedCodeIdx, setExpandedCodeIdx] = useState(0);

  const loadData = async () => {
    try {
      const data = await similarityApi.getById(id);
      if (data) {
        setResult({
          ...data,
          similarityScore: data.similarity_score ?? data.similarityScore ?? 0,
          similarityLevel: data.similarity_level ?? data.similarityLevel ?? 'low',
          matchedTechnologies: data.matched_technologies ?? data.matchedTechnologies ?? [],
          matchedConcepts: data.matched_concepts ?? data.matchedConcepts ?? [],
          llmExplanation: data.llm_explanation ?? data.llmExplanation,
          sourceProject: data.source_project ?? data.sourceProject,
          similarProject: data.similar_project ?? data.similarProject,
          codeSegments: data.code_segments || [],
        });
      }

      // Check for active reuse request in the database
      const recs = await approvalsApi.getRecommendations();
      if (Array.isArray(recs)) {
        const match = recs.find(
          (r) => (r.similarity_result === parseInt(id) || r.similarityResult?.id === parseInt(id))
        );
        if (match) {
          setReuseRequest(match);
        }
      }
    } catch (err) {
      console.warn('API error in SimilarityDetail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRequestReuse = async () => {
    try {
      setIsSubmittingRequest(true);
      const similarTitle = result.similarProject?.title || 'Baseline Project';
      const res = await approvalsApi.requestReuse({
        similarity_id: result.id,
        notes: requestNotes || `Developer requested Git repository and source code access for: ${similarTitle}`,
        requested_modules: result.matchedTechnologies?.slice(0, 4).join(', ') || 'Authentication, Express Routes & Database Pool',
        hours_saved: 160,
      });
      toast.success('Request Sent to Manager!', 'Engineering Manager has been notified to review and unlock the Git repository.');
      if (res && res.recommendation) {
        setReuseRequest(res.recommendation);
      }
      setShowRequestModal(false);
      loadData();
    } catch (err) {
      toast.error('Request Failed', err.message || 'Unable to submit reuse request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: '4rem' }}>
        <div className="spinner" style={{ width: 44, height: 44, margin: '0 auto 1.25rem' }} />
        <h3 className="empty-state-title">Loading Similarity & AST Analysis...</h3>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="empty-state" style={{ padding: '4rem' }}>
        <div className="empty-state-icon">🔍</div>
        <h3 className="empty-state-title">Similarity Result Not Found</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          This scan could not be retrieved from the database.
        </p>
        <Link to="/similarity" className="btn btn-primary">← Back to Results</Link>
      </div>
    );
  }

  const score = result.similarityScore;
  const isApproved = result.is_unlocked || result.approval_status === 'approved' || (reuseRequest && reuseRequest.status === 'approved');
  const isPending = !isApproved && (result.approval_status === 'pending' || (reuseRequest && reuseRequest.status === 'pending'));
  const downloadRecId = reuseRequest?.id || result.recommendation_id || result.id;
  const githubUrl = result.similarProject?.github_url || result.similarProject?.githubUrl || 'https://github.com/Gokul-anand-b/real-estate-portal';
  const codeSegments = result.codeSegments || [];

  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <Link to="/similarity" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem', textDecoration: 'none' }}>
          ← Back to Similarity Results
        </Link>
        <h1 className="page-title">Semantic Vector Match & Code Overlap</h1>
      </div>

      {/* Hero Card */}
      <div className="sim-detail-hero" style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${SIMILARITY_LEVELS[result.similarityLevel]?.bgClass || 'badge-sim-high'}`}>
              {SIMILARITY_LEVELS[result.similarityLevel]?.label || 'High Similarity'}
            </span>
            {isApproved ? (
              <span className="badge badge-approved" style={{ fontWeight: 700 }}>
                🔓 Git Repo Unlocked
              </span>
            ) : isPending ? (
              <span className="badge badge-pending" style={{ fontWeight: 700 }}>
                ⏳ Manager Approval Pending
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                🔒 Git Repo Locked
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            {result.sourceProject?.title}
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span>Matches existing project:</span>
            <strong style={{ color: '#c4b5fd' }}>{result.similarProject?.title}</strong>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            Vector Search ID: #{result.id} • Scanned {result.created_at ? formatDate(result.created_at) : 'recently'}
          </div>
        </div>

        {/* Circular Similarity Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', width: 105, height: 105 }}>
            <svg width="105" height="105" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={getSimilarityColor(score)}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: getSimilarityColor(score), lineHeight: 1 }}>
                {score}%
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overlap
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP STATUS & QUICK UNLOCK CARD */}
      {isApproved ? (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 95, 70, 0.35) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.55)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 12px 35px rgba(16, 185, 129, 0.2)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎉</span>
              <h3 style={{ margin: 0, color: '#6ee7b7', fontSize: '1.15rem', fontWeight: 800 }}>
                Repository & Source Code Access Unlocked!
              </h3>
              <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>Manager Approved</span>
            </div>
            <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.88rem', maxWidth: '650px' }}>
              The Engineering Manager has reviewed and approved code reuse for this project. The verified source code files and Git repository are unlocked.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>🌐</span> Open GitHub Repository ↗
              </a>
            )}
            <a
              href={approvalsApi.getDownloadUrl(downloadRecId)}
              download
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: '#fff',
              }}
            >
              <span>⬇️</span> Download Code (.ZIP)
            </a>
          </div>
        </div>
      ) : isPending ? (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.25) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⏳</span>
              <h3 style={{ margin: 0, color: '#fcd34d', fontSize: '1.1rem', fontWeight: 800 }}>
                Approval Request Sent to Manager
              </h3>
              <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>Pending Review</span>
            </div>
            <p style={{ margin: 0, color: '#fef3c7', fontSize: '0.86rem', maxWidth: '650px' }}>
              Your request to access the Git repository and code from "{result.similarProject?.title}" is awaiting review by the Engineering Manager.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowRequestModal(true)}
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              borderColor: 'rgba(245, 158, 11, 0.5)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            <span>✏️</span> Update Request Note
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(124, 58, 237, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🔒</span>
              <h3 style={{ margin: 0, color: '#c4b5fd', fontSize: '1.1rem', fontWeight: 800 }}>
                Git Repository & Codebase Locked
              </h3>
              <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                Manager Approval Required
              </span>
            </div>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.86rem', maxWidth: '650px' }}>
              Architectural overlap detected with existing completed project "{result.similarProject?.title}". Send a request to the Engineering Manager to unlock access.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowRequestModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 800,
            }}
          >
            <span>📬</span> Send Request to Manager
          </button>
        </div>
      )}

      {/* Grid Features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Matched Tech */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
            <span>⚡ Matched Technologies</span>
          </h3>
          <div className="stagger-children" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {result.matchedTechnologies.map((tech) => (
              <span key={tech} className="tech-tag matched" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Matched Concepts */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
            <span>💡 Matched Concepts</span>
          </h3>
          <ul className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
            {result.matchedConcepts.map((concept) => (
              <li key={concept} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#c4b5fd' }}>✦</span> {concept}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RAG-Generated AI Explanation */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>RAG & LLM Semantic Explanation</h3>
            <span style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>Grounding context retrieved via FAISS vector embedding search</span>
          </div>
        </div>

        <div style={{
          padding: '1.15rem',
          background: 'rgba(124, 58, 237, 0.08)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          lineHeight: '1.7',
          color: 'var(--color-text-primary)',
          fontSize: '0.92rem',
          borderLeft: '3px solid var(--color-accent-purple)',
        }}>
          {result.llmExplanation}
        </div>
      </div>

      {/* AST CODE SEGMENTS & CODE SIMILARITY SECTION */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🧩</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Decomposed AST Code Segments in Baseline Project
              </h3>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Real functions, route endpoints, and middleware parsed from <strong>{result.similarProject?.title}</strong>
            </p>
          </div>
          <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
            {codeSegments.length} AST Nodes Identified
          </span>
        </div>

        {codeSegments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            No extracted AST code segments recorded for this baseline repository.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>
            {/* Segment Selector List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {codeSegments.map((seg, idx) => (
                <button
                  key={seg.id || idx}
                  type="button"
                  onClick={() => setExpandedCodeIdx(idx)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    background: expandedCodeIdx === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: expandedCodeIdx === idx ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid transparent',
                    color: expandedCodeIdx === idx ? '#6ee7b7' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {seg.name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: seg.segment_type === 'endpoint' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                    color: seg.segment_type === 'endpoint' ? '#93c5fd' : '#c4b5fd',
                  }}>
                    {seg.segment_type}
                  </span>
                </button>
              ))}
            </div>

            {/* Segment Code Viewer */}
            {codeSegments[expandedCodeIdx] && (
              <div style={{
                background: '#0a0f1d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📁</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {codeSegments[expandedCodeIdx].file_path}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      (Lines {codeSegments[expandedCodeIdx].start_line}–{codeSegments[expandedCodeIdx].end_line})
                    </span>
                  </div>
                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                    {codeSegments[expandedCodeIdx].segment_type}
                  </span>
                </div>

                <pre style={{
                  margin: 0,
                  padding: '1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  background: 'transparent',
                }}>
                  <code>{codeSegments[expandedCodeIdx].code_content}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* PROMINENT REQUEST BUTTON DIRECTLY AFTER CODE SIMILARITY */}
        <div style={{
          marginTop: '2rem',
          padding: '1.75rem 2rem',
          borderRadius: '14px',
          background: isApproved
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : isPending
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: isApproved
            ? '1px solid rgba(16, 185, 129, 0.6)'
            : isPending
            ? '1px solid rgba(245, 158, 11, 0.5)'
            : '1px solid rgba(139, 92, 246, 0.6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{isApproved ? '🔓' : isPending ? '⏳' : '🔒'}</span>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                {isApproved
                  ? 'Git Repository Access is UNLOCKED!'
                  : isPending
                  ? 'Approval Request is Pending Manager Review'
                  : 'Ready to Reuse This Codebase? Request Manager Approval'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', maxWidth: '640px', lineHeight: 1.5 }}>
              {isApproved
                ? `You have manager authorization to clone, inspect, and reuse the source code and Git repository from "${result.similarProject?.title}".`
                : isPending
                ? `Your request to access the Git repository from "${result.similarProject?.title}" was forwarded to the Engineering Manager.`
                : `Submit an access request to the Engineering Manager. Once approved, the GitHub repository link and complete source code (.ZIP) will unlock immediately.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isApproved ? (
              <>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                      borderColor: 'rgba(16, 185, 129, 0.5)',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 1.6rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>🌐</span> Open GitHub Repository ↗
                  </a>
                )}
                <a
                  href={approvalsApi.getDownloadUrl(downloadRecId)}
                  download
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1.6rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#fff',
                  }}
                >
                  <span>⬇️</span> Download Approved Code (.ZIP)
                </a>
              </>
            ) : isPending ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-pending" style={{ padding: '0.7rem 1.25rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  ⏳ Awaiting Manager Approval
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRequestModal(true)}
                  style={{
                    padding: '0.7rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderColor: 'rgba(245, 158, 11, 0.5)',
                    color: '#fbbf24',
                  }}
                >
                  <span>✏️</span> Update Note
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="request-manager-approval-bottom-btn"
                className="btn btn-primary"
                onClick={() => setShowRequestModal(true)}
                style={{
                  padding: '0.9rem 1.8rem',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  borderRadius: '8px',
                }}
              >
                <span>📬</span> Send Request to Manager for Git Repository Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code Reuse Request Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="glass-card" style={{
            maxWidth: '540px',
            width: '100%',
            padding: '2.25rem',
            background: '#121215',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📬</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Send Request to Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Request authorization from the Engineering Manager to access the Git repository and codebase for <strong style={{ color: '#ffffff' }}>"{result.similarProject?.title}"</strong>.
            </p>

            <div className="form-group mb-4">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Reason & Modules to Reuse
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder={`Example: Requesting approval to reuse the Express API routes, JWT authentication middleware, and MySQL database pool from ${result.similarProject?.title} to save ~160 hours.`}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmittingRequest}
                onClick={handleRequestReuse}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: 800,
                }}
              >
                {isSubmittingRequest ? 'Sending to Manager...' : 'Submit Request to Manager →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
