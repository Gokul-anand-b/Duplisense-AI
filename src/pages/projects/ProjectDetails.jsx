import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi, similarityApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { PROJECT_STATUSES, SIMILARITY_LEVELS } from '../../utils/constants';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [similarResults, setSimilarResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [proj, sims] = await Promise.all([
          projectsApi.getById(id),
          similarityApi.getAll(),
        ]);
        if (proj) setProject(proj);
        if (Array.isArray(sims)) {
          const matched = sims.filter(
            (r) => r.source_project?.id === parseInt(id) || r.similar_project?.id === parseInt(id)
          );
          setSimilarResults(matched);
        }
      } catch (err) {
        console.warn('ProjectDetails fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: '4rem' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
        <h3 className="empty-state-title">Loading Project Details...</h3>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state" style={{ padding: '4rem' }}>
        <div className="empty-state-icon">🔍</div>
        <h3 className="empty-state-title">Project Not Found</h3>
        <p className="empty-state-text">The requested project metadata could not be located in the database.</p>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Projects</Link>
      </div>
    );
  }

  const techs = project.technologies || project.programming_languages || [];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <Link to="/projects" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem', textDecoration: 'none' }}>
              ← Back to Projects
            </Link>
            <h1 className="page-title">{project.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge ${PROJECT_STATUSES[project.status]?.class || 'badge-completed'}`}>
                {PROJECT_STATUSES[project.status]?.label || project.status}
              </span>
              <span className="text-sm text-muted">
                {project.department?.name || project.department_name || 'Engineering'}
              </span>
              {project.created_at && (
                <>
                  <span className="text-sm text-muted">•</span>
                  <span className="text-sm text-muted">Created {formatDate(project.created_at)}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', color: '#34d399' }}
              >
                🌐 Open Git Repo ↗
              </a>
            )}
            {similarResults[0] && (
              <Link to={`/similarity/${similarResults[0].id}`} className="btn btn-primary">
                🔍 View AI Match ({similarResults[0].similarity_score}%)
              </Link>
            )}
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

          {/* Problem Statement */}
          {project.problem_statement && (
            <div className="detail-section">
              <h3 className="detail-section-title">⚠️ Problem Statement</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                {project.problem_statement}
              </p>
            </div>
          )}

          {/* Objectives */}
          {project.objectives && (
            <div className="detail-section">
              <h3 className="detail-section-title">🎯 Core Objectives</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem', whiteSpace: 'pre-line' }}>
                {project.objectives}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tech Stack */}
          <div className="detail-section">
            <h3 className="detail-section-title">🛠️ Technology Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {techs.map((tech) => (
                <span key={tech} className="tech-tag" style={{ fontSize: '0.85rem' }}>{tech}</span>
              ))}
            </div>
          </div>

          {/* Similarity Matches */}
          {similarResults.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">⚡ Detected Similarities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {similarResults.map((sim) => (
                  <Link
                    key={sim.id}
                    to={`/similarity/${sim.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {sim.similar_project?.title || 'Matched Project'}
                      </div>
                      <span className="badge badge-approved" style={{ fontWeight: 700 }}>
                        {sim.similarity_score}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
