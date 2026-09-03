import { Link } from 'react-router-dom';
import { mockSimilarityResults } from '../../data/mockData';
import { truncate, getSimilarityColor } from '../../utils/helpers';
import { SIMILARITY_LEVELS } from '../../utils/constants';

export default function SimilarityResults() {
  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Similarity Results</h1>
        <p className="page-subtitle">
          All detected similarities between projects across your organization
        </p>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockSimilarityResults.map((result) => (
          <Link
            key={result.id}
            to={`/similarity/${result.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="sim-card">
              <div className="sim-card-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{result.sourceProject.title}</span>
                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>↔</span>
                    <span style={{ fontWeight: 600 }}>{result.similarProject.title}</span>
                  </div>
                  <div className="sim-card-meta">
                    {result.sourceProject.team.name} → {result.similarProject.team.name} •{' '}
                    {result.matchedTechnologies.length} matched technologies
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: getSimilarityColor(result.similarityScore),
                    lineHeight: 1,
                    textShadow: `0 0 20px ${getSimilarityColor(result.similarityScore)}40`,
                  }}>
                    {result.similarityScore}%
                  </div>
                  <span className={`badge ${SIMILARITY_LEVELS[result.similarityLevel].bgClass}`} style={{ marginTop: 4 }}>
                    {SIMILARITY_LEVELS[result.similarityLevel].label}
                  </span>
                </div>
              </div>

              <div className="sim-card-matches">
                {result.matchedTechnologies.map((tech) => (
                  <span key={tech} className="tech-tag matched">{tech}</span>
                ))}
              </div>

              <div className="sim-card-footer">
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {truncate(result.llmExplanation, 120)}
                </div>
                <span className="btn btn-ghost btn-sm" style={{ flexShrink: 0, marginLeft: '1rem' }}>
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
