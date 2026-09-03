import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockSimilarityResults, mockRecommendations } from '../../data/mockData';
import { similarityApi, approvalsApi, projectsApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getSimilarityColor } from '../../utils/helpers';
import { SIMILARITY_LEVELS, RECOMMENDATION_CATEGORIES, RECOMMENDATION_STATUSES } from '../../utils/constants';

export default function SimilarityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [result, setResult] = useState(() => mockSimilarityResults.find((r) => r.id === parseInt(id)) || null);
  const [loading, setLoading] = useState(!result);
  const [reuseRequest, setReuseRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    async function loadData() {
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
          });
        }

        // Check if a reuse request already exists for this similarity result
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
        console.warn('API error, using fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleRequestReuse = async () => {
    try {
      setIsSubmittingRequest(true);
      const res = await approvalsApi.requestReuse({
        similarity_id: result.id,
        notes: requestNotes || `Developer requested source code access for similar project: ${result.similarProject?.title}`,
        requested_modules: result.matchedTechnologies?.slice(0, 4).join(', ') || 'Core Modules & Pipeline',
        hours_saved: 160,
      });
      toast.success('Request Sent to Admin!', 'Admin has been notified to review and approve source code access.');
      setReuseRequest(res.recommendation);
      setShowRequestModal(false);
    } catch (err) {
      toast.error('Request Failed', err.message || 'Unable to submit reuse request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
        <h3 className="empty-state-title">Loading Similarity Breakdown...</h3>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3 className="empty-state-title">Result Not Found</h3>
        <Link to="/similarity" className="btn btn-primary">← Back</Link>
      </div>
    );
  }

  const recommendations = mockRecommendations.filter(
    (rec) => rec.similarityResult?.id === result.id
  );
  const score = result.similarityScore;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <Link to="/similarity" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}>
          ← Back to Similarity Results
        </Link>
        <h1 className="page-title">Semantic Similarity & AI Analysis</h1>
      </div>

      {/* Cyber AI Score Banner — Dark Purple */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(16, 14, 30, 0.88) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Circular Animated Gauge */}
          <div className="sim-gauge" style={{ position: 'relative' }}>
            <div className="sim-gauge-circle" style={{ width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle className="sim-gauge-track" cx="50" cy="50" r="42" />
                <circle
                  className="sim-gauge-fill"
                  cx="50" cy="50" r="42"
                  stroke={getSimilarityColor(score)}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    '--gauge-circumference': circumference,
                    '--gauge-offset': dashOffset,
                    filter: `drop-shadow(0 0 10px ${getSimilarityColor(score)})`,
                  }}
                />
              </svg>
              <div className="sim-gauge-value" style={{ color: getSimilarityColor(score), fontSize: '1.75rem', fontWeight: 800 }}>
                {score}%
              </div>
            </div>
            <span className={`badge ${SIMILARITY_LEVELS[result.similarityLevel].bgClass}`} style={{ marginTop: '0.75rem', padding: '0.4rem 0.85rem' }}>
              {SIMILARITY_LEVELS[result.similarityLevel].label}
            </span>
          </div>

          {/* Side-by-side Project Cards */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Source Project
              </div>
              <Link to={`/projects/${result.sourceProject.id}`} style={{ fontWeight: 700, fontSize: '1.125rem', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
                {result.sourceProject.title}
              </Link>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                {result.sourceProject.team.name} • {result.sourceProject.department.name}
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', color: '#c4b5fd', fontWeight: 300, animation: 'subtlePulse 2s ease infinite' }}>
              ⚡
            </div>

            <div style={{
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Matched Project
              </div>
              <Link to={`/projects/${result.similarProject.id}`} style={{ fontWeight: 700, fontSize: '1.125rem', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
                {result.similarProject.title}
              </Link>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                {result.similarProject.team.name} • {result.similarProject.department.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Reuse Request & Download Workflow Card */}
      {reuseRequest && reuseRequest.status === 'approved' ? (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 95, 70, 0.35) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.55)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 12px 35px rgba(16, 185, 129, 0.2)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎉</span>
              <h3 style={{ margin: 0, color: '#6ee7b7', fontSize: '1.2rem', fontWeight: 800 }}>
                Source Code Access Granted by Admin!
              </h3>
              <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>Approved</span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#a7f3d0', fontSize: '0.9rem', maxWidth: '650px', lineHeight: 1.5 }}>
              The administrator has reviewed and approved code reuse for this project. The verified source code files, architecture templates, and implementation guides are ready for direct download.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={approvalsApi.getDownloadUrl(reuseRequest.id)}
              download
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.6rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: '#fff',
                borderRadius: '8px',
              }}
            >
              <span>⬇️</span> Download Approved Code (.ZIP)
            </a>
          </div>
        </div>
      ) : reuseRequest && reuseRequest.status === 'pending' ? (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.25) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⏳</span>
              <h3 style={{ margin: 0, color: '#fcd34d', fontSize: '1.1rem', fontWeight: 800 }}>
                Code Reuse Request Sent to Admin
              </h3>
              <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>Pending Review</span>
            </div>
            <p style={{ margin: 0, color: '#fef3c7', fontSize: '0.85rem', maxWidth: '650px' }}>
              Your request to reuse the source code and pipeline from "{result.similarProject?.title}" is awaiting review in the Admin Approval portal. Once approved, the download button will activate immediately.
            </p>
          </div>
          <Link to="/approvals" className="btn btn-secondary" style={{ fontSize: '0.85rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
            View in Approvals Portal →
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(124, 58, 237, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>📬</span>
              <h3 style={{ margin: 0, color: '#c4b5fd', fontSize: '1.1rem', fontWeight: 800 }}>
                Request Existing Project Source Code
              </h3>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Developer Reuse</span>
            </div>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', maxWidth: '650px' }}>
              Submit a 1-click reuse request to the Admin. Once approved, the overlapping source code files, AST functions, and setup guides will be packaged as a downloadable ZIP archive.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowRequestModal(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            <span>🚀</span> Request Code Access from Admin
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
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', animation: 'floatY 3s ease-in-out infinite' }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>RAG & LLM Semantic Explanation</h3>
            <span style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>Grounding context retrieved via FAISS vector embedding search</span>
          </div>
        </div>

        <div style={{
          padding: '1.25rem',
          background: 'rgba(124, 58, 237, 0.08)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          lineHeight: '1.7',
          color: 'var(--color-text-primary)',
          fontSize: '0.9375rem',
          borderLeft: '3px solid var(--color-accent-purple)',
        }}>
          {result.llmExplanation}
        </div>
      </div>

      {/* Recommended Reuse Modules */}
      {recommendations.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>Recommended Reusable Components</h2>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map((rec) => {
              const cat = RECOMMENDATION_CATEGORIES[rec.category];
              return (
                <div key={rec.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span className={`rec-category ${cat.class}`}>
                      {cat.icon} {cat.label}
                    </span>
                    <span className={`badge ${RECOMMENDATION_STATUSES[rec.status].class}`}>
                      {RECOMMENDATION_STATUSES[rec.status].label}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: '#f8fafc' }}>{rec.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{rec.description}</p>
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-tertiary)',
                    borderLeft: '3px solid var(--color-accent-purple)'
                  }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Evidence:</strong> {rec.evidence}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Code Reuse Request Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            background: '#0f172a',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📬</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Request Source Code Access
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              You are requesting source code access for <strong style={{ color: '#c4b5fd' }}>"{result.similarProject?.title}"</strong>. This request will be forwarded to the Admin panel for validation.
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
                placeholder={`Example: Requesting permission to reuse the ${result.matchedTechnologies?.slice(0, 3).join(', ') || 'shared'} pipeline and authentication middleware to save ~160 engineering hours.`}
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
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {isSubmittingRequest ? 'Sending to Admin...' : 'Submit Request to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
