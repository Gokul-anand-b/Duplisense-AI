import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, approvalsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function ManagerDashboard({ user }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('ingest'); // 'ingest' | 'approvals' | 'projects'
  
  // Pending approvals
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  // Completed projects in Vector DB
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Form for Ingesting Completed Project into Vector DB
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeZipFile, setCodeZipFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    problemStatement: '',
    objectives: '',
    programmingLanguages: '',
    frameworks: '',
    databaseTech: '',
    apisUsed: '',
    githubUrl: '',
    documentationUrl: '',
  });

  // Load pending approvals and completed projects from DB
  const loadData = async () => {
    try {
      const recs = await approvalsApi.getRecommendations('pending');
      if (Array.isArray(recs)) {
        setPendingRequests(recs);
      }
      const projs = await projectsApi.getAll({ status: 'completed' });
      if (Array.isArray(projs)) {
        setCompletedProjects(projs);
      }
    } catch (err) {
      console.warn('Load error:', err);
    } finally {
      setLoadingApprovals(false);
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manager Approves Developer Request to Unlock Code
  const handleApprove = async (recId, projectTitle) => {
    try {
      await approvalsApi.approve(recId, {
        notes: `Manager approved source code and Git repository access for ${projectTitle}.`,
        hours_saved: 160,
      });
      toast.success('Approved!', `Repository access unlocked for "${projectTitle}".`);
      loadData();
    } catch (err) {
      toast.error('Approval Failed', err.message);
    }
  };

  // Manager Rejects Request
  const handleReject = async (recId) => {
    try {
      await approvalsApi.reject(recId);
      toast.warning('Rejected', 'Request rejected.');
      loadData();
    } catch (err) {
      toast.error('Rejection Failed', err.message);
    }
  };

  // Ingest Completed Project into Vector Database
  const handleIngestCompletedProject = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Required Fields', 'Please enter Project Title and Description.');
      return;
    }

    setIsSubmitting(true);
    toast.info('Indexing into Vector Database', 'Saving completed project and compiling FAISS dense vector embeddings...');

    try {
      const splitTech = (str) => (str ? str.split(',').map((s) => s.trim()).filter(Boolean) : []);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        problem_statement: form.problemStatement.trim(),
        objectives: form.objectives.trim(),
        programming_languages: splitTech(form.programmingLanguages),
        frameworks: splitTech(form.frameworks),
        database_tech: splitTech(form.databaseTech),
        apis_used: splitTech(form.apisUsed),
        github_url: form.githubUrl.trim(),
        documentation_url: form.documentationUrl.trim(),
        status: 'completed', // Production Ready
      };

      const res = await projectsApi.submit(payload);

      // If code ZIP attached, upload and segment into AST nodes
      if (res && res.project && codeZipFile) {
        toast.info('Ingesting Codebase', `Decomposing "${codeZipFile.name}" into AST functions and endpoints...`);
        await projectsApi.uploadCodebase(res.project.id, codeZipFile);
      }

      toast.success('Completed Project Ingested!', 'Project and code indexed directly into FAISS Vector Database.');
      
      // Reset form
      setForm({
        title: '',
        description: '',
        problemStatement: '',
        objectives: '',
        programmingLanguages: '',
        frameworks: '',
        databaseTech: '',
        apisUsed: '',
        githubUrl: '',
        documentationUrl: '',
      });
      setCodeZipFile(null);
      setDocFile(null);
      loadData();
      setActiveTab('projects');
    } catch (err) {
      console.error(err);
      toast.error('Ingestion Failed', err.message || 'Could not ingest completed project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Manager Hero Banner */}
      <div style={{
        padding: '2.25rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(24, 24, 27, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}>
              <span>👔</span> ENGINEERING MANAGEMENT PORTAL
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.35rem 0', color: '#ffffff' }}>
              Management Hub, <span className="text-gradient-cyber">{user?.firstName || 'Manager'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '680px', lineHeight: 1.5, margin: 0 }}>
              Ingest completed production repositories directly into the FAISS Vector Database, and approve developer requests to unlock source code and Git repository access.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {pendingRequests.length} Pending Approval{pendingRequests.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab ${activeTab === 'ingest' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingest')}
        >
          📥 Ingest Completed Project into Vector DB
        </button>
        <button
          className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          📋 Pending Approvals ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          🗃️ Completed Projects in Vector DB ({completedProjects.length})
        </button>
      </div>

      {/* TAB 1: INGEST COMPLETED PROJECT INTO VECTOR DB */}
      {activeTab === 'ingest' && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📥</span> Upload Completed Production Project (Baseline Vector DB)
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Projects ingested here become the ground truth in the FAISS Vector Database. When developers submit proposals, their specifications and requirements will be matched against this project.
            </p>
          </div>

          <form onSubmit={handleIngestCompletedProject}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Project Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Real Estate Property Management & Rental Portal"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  System Architecture & Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="Comprehensive description of the completed architecture, workflows, and modules..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Problem Statement Solved</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={2}
                    placeholder="Problem solved by this completed system..."
                    value={form.problemStatement}
                    onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Core Objectives / Key Deliverables</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={2}
                    placeholder="Key deliverables and modules..."
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    GitHub Repository URL <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/Gokul-anand-b/real-estate-portal"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Documentation URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://docs.enterprise.internal/repo"
                    value={form.documentationUrl}
                    onChange={(e) => setForm({ ...form, documentationUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Programming Languages</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. JavaScript, SQL, HTML"
                    value={form.programmingLanguages}
                    onChange={(e) => setForm({ ...form, programmingLanguages: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Frameworks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Node.js, Express, Socket.IO"
                    value={form.frameworks}
                    onChange={(e) => setForm({ ...form, frameworks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Database Tech</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MySQL, Redis"
                    value={form.databaseTech}
                    onChange={(e) => setForm({ ...form, databaseTech: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>APIs Used</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. REST API, Multer, JWT"
                    value={form.apisUsed}
                    onChange={(e) => setForm({ ...form, apisUsed: e.target.value })}
                  />
                </div>
              </div>

              {/* File Uploads: Code Archive & Report */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    📦 Source Codebase Archive (.ZIP)
                  </label>
                  <input
                    type="file"
                    accept=".zip"
                    className="form-input"
                    onChange={(e) => setCodeZipFile(e.target.files[0] || null)}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Uploaded code is segmented into AST functions and indexed in FAISS Code Index.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    📑 Architecture Documentation (.PDF / .DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="form-input"
                    onChange={(e) => setDocFile(e.target.files[0] || null)}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Documentation report attached to the completed baseline project.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  padding: '0.85rem 1.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>Indexing into FAISS Vector Database...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Ingest Completed Project & Rebuild Vector Index</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Developer Repository Access Requests
              </h3>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Review requests submitted by developers. When approved, the Git repository link and source code files are unlocked for the developer.
              </p>
            </div>
            <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
              {pendingRequests.length} Pending Review
            </span>
          </div>

          {loadingApprovals ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
              <span>Loading pending approvals...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>No Pending Requests</h4>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                All developer access requests have been reviewed and approved.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>Pending Review</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID #{req.id}</span>
                    </div>

                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      {req.title}
                    </h4>

                    <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {req.description}
                    </p>

                    {req.evidence && (
                      <div style={{
                        fontSize: '0.78rem',
                        color: '#a7f3d0',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'inline-block',
                      }}>
                        💡 {req.evidence}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleApprove(req.id, req.title)}
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                        fontSize: '0.875rem',
                        padding: '0.65rem 1.3rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Approve & Unlock Git Access
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleReject(req.id)}
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontSize: '0.875rem',
                        padding: '0.65rem 1rem',
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED PROJECTS IN VECTOR DB */}
      {activeTab === 'projects' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🗃️</span> Completed Baseline Repositories in Vector Database
              </h3>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                These production projects are indexed in `faiss_vector_index.bin` and used to detect duplicate developer proposals.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('ingest')}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              + Ingest New Completed Project
            </button>
          </div>

          {loadingProjects ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
              <span>Loading completed projects...</span>
            </div>
          ) : completedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <p>No completed baseline projects found. Ingest one above.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Project Title</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>GitHub Repository</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tech Stack</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {completedProjects.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {p.title}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>
                          COMPLETED
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {p.github_url ? (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <span>🌐</span> {p.github_url} ↗
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>No Git URL</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                        {p.all_technologies?.slice(0, 4).join(', ') || 'Shared Stack'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link
                          to={`/projects/${p.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', textDecoration: 'none' }}
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
