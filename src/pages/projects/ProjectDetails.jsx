import { useParams, Link } from 'react-router-dom';
import { mockProjects, mockSimilarityResults } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import { PROJECT_STATUSES, SIMILARITY_LEVELS } from '../../utils/constants';

export default function ProjectDetails() {
  const { id } = useParams();
  const project = mockProjects.find((p) => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3 className="empty-state-title">Project Not Found</h3>
        <p className="empty-state-text">The requested project metadata could not be located.</p>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Projects</Link>
      </div>
    );
  }

  const similarResults = mockSimilarityResults.filter(
    (r) => r.sourceProject.id === project.id || r.similarProject.id === project.id
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <Link to="/projects" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              ← Back to Projects
            </Link>
            <h1 className="page-title">{project.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge ${PROJECT_STATUSES[project.status]?.class}`}>
                <span className="badge-dot" />
                {PROJECT_STATUSES[project.status]?.label}
              </span>
              <span className="text-sm text-muted">
                Submitted by {project.submittedBy.firstName} {project.submittedBy.lastName}
              </span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">{project.team.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/projects/${project.id}/edit`} className="btn btn-secondary">✏️ Edit Details</Link>
            <Link to={`/similarity/${similarResults[0]?.id || 1}`} className="btn btn-primary">🔍 View AI Match</Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section-title">📋 Project Overview</h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              {project.description}
            </p>
          </div>

          {/* Problem & Objectives */}
          <div className="detail-section">
            <h3 className="detail-section-title">🎯 Problem & Objectives</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div className="detail-label" style={{ marginBottom: '0.35rem' }}>Problem Statement</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{project.problemStatement}</p>
            </div>
            <div>
              <div className="detail-label" style={{ marginBottom: '0.35rem' }}>Core Objectives</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{project.objectives}</p>
            </div>
          </div>

          {/* Technologies */}
          <div className="detail-section">
            <h3 className="detail-section-title">⚡ Stack & Dependencies</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Languages</span>
                <span className="detail-value">{project.programmingLanguages}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Frameworks</span>
                <span className="detail-value">{project.frameworks}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Database</span>
                <span className="detail-value">{project.databaseTech}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">APIs</span>
                <span className="detail-value">{project.apisUsed || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">AI/ML & Embedding</span>
                <span className="detail-value">{project.aiMlTech || '—'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.25rem' }}>
              {project.technologies.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
          </div>

          {/* Resources */}
          {project.resources && project.resources.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">📦 Linked Architecture Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {project.resources.map((res) => (
                  <div
                    key={res.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      background: 'rgba(255,255,255,0.5)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                    }}
                  >
                    <span className={`rec-category ${res.type}`}>
                      {res.type === 'code' ? '💻' : res.type === 'api' ? '🔌' : res.type === 'database' ? '🗄️' : res.type === 'ui' ? '🎨' : res.type === 'documentation' ? '📄' : '👤'}
                      {' '}{res.type.charAt(0).toUpperCase() + res.type.slice(1)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{res.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{res.description}</div>
                    </div>
                    {res.url && (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 'calc(var(--topnav-height) + 1.5rem)' }}>
          {/* Meta Info */}
          <div className="detail-section">
            <h3 className="detail-section-title">ℹ️ Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{project.department.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Team</span>
                <span className="detail-value">{project.team.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created Date</span>
                <span className="detail-value">{formatDate(project.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Synchronization</span>
                <span className="detail-value">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="detail-section">
            <h3 className="detail-section-title">🔗 External Links</h3>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full mb-2" style={{ justifyContent: 'flex-start' }}>
                🐙 GitHub Repository
              </a>
            )}
            {project.documentationUrl && (
              <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>
                📄 Documentation Portal
              </a>
            )}
          </div>

          {/* Similar Projects Quick View */}
          {similarResults.length > 0 && (
            <div className="detail-section" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <h3 className="detail-section-title" style={{ borderBottom: 'none', marginBottom: '0.75rem' }}>
                🔍 Similar Projects Detected
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {similarResults.map((r) => {
                  const otherProject = r.sourceProject.id === project.id ? r.similarProject : r.sourceProject;
                  return (
                    <Link
                      key={r.id}
                      to={`/similarity/${r.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.2s ease',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{otherProject.title}</div>
                          <span className={`badge ${SIMILARITY_LEVELS[r.similarityLevel].bgClass}`} style={{ marginTop: 4 }}>
                            {r.similarityScore}% • {SIMILARITY_LEVELS[r.similarityLevel].label}
                          </span>
                        </div>
                        <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
