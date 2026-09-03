import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockProjects } from '../../data/mockData';
import { formatDate, truncate } from '../../utils/helpers';
import { PROJECT_STATUSES } from '../../utils/constants';

export default function ProjectList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesDept = deptFilter === 'all' || p.department.name === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [search, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const departments = [...new Set(mockProjects.map((p) => p.department.name))];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Enterprise Projects</h1>
            <p className="page-subtitle">{mockProjects.length} projects cataloged across your organization</p>
          </div>
          <Link to="/submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            ⚡ Submit New Project
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search projects, technologies, or keywords..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="filter-select"
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {paged.length > 0 ? (
        <div className="grid-3 stagger-children" style={{ gap: '1.25rem' }}>
          {paged.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass-card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, flex: 1, lineHeight: 1.3 }}>
                    {project.title}
                  </h3>
                  <span className={`badge ${PROJECT_STATUSES[project.status]?.class || 'badge-draft'}`}>
                    <span className="badge-dot" />
                    {PROJECT_STATUSES[project.status]?.label || project.status}
                  </span>
                </div>

                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', flex: 1, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  {truncate(project.description, 120)}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="tech-tag">+{project.technologies.length - 5}</span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(16, 185, 129, 0.08)',
                  paddingTop: '0.85rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-tertiary)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <span>👤 {project.submittedBy.firstName} {project.submittedBy.lastName}</span>
                  <span>🏢 {project.team.name}</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-text">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '2rem' }}>
          <span className="pagination-info">
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
