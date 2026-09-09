import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import { formatDate, truncate } from '../../utils/helpers';
import { PROJECT_STATUSES } from '../../utils/constants';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projectsApi.getAll();
        if (Array.isArray(data)) {
          setProjects(data);
        }
      } catch (err) {
        console.warn('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const techs = p.technologies || p.programming_languages || [];
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        techs.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const deptName = p.department?.name || p.department_name || '';
      const matchesDept = deptFilter === 'all' || deptName === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [projects, search, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const departments = [...new Set(projects.map((p) => p.department?.name || p.department_name).filter(Boolean))];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Enterprise Projects Catalog</h1>
            <p className="page-subtitle">{projects.length} real projects stored in database</p>
          </div>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            ⚡ Submit New Proposal
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
          <option value="completed">Completed (Baseline)</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        {departments.length > 0 && (
          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        )}
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
          <h3 className="empty-state-title">Loading Projects from Database...</h3>
        </div>
      ) : paged.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-state-icon">📁</div>
          <h3 className="empty-state-title">No Projects Found</h3>
          <p className="empty-state-description">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid-3 stagger-children">
          {paged.map((project) => {
            const techs = project.technologies || project.programming_languages || [];
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="project-card">
                  <div className="project-card-header">
                    <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                      {project.department?.name || project.department_name || 'Engineering'}
                    </span>
                    <span className={`badge ${PROJECT_STATUSES[project.status]?.class || 'badge-completed'}`}>
                      {PROJECT_STATUSES[project.status]?.label || project.status}
                    </span>
                  </div>

                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-desc">{truncate(project.description, 120)}</p>

                  <div className="project-card-tech">
                    {techs.slice(0, 4).map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                    {techs.length > 4 && (
                      <span className="tech-tag" style={{ background: 'transparent' }}>
                        +{techs.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="project-card-footer">
                    <span className="text-xs text-muted">
                      {project.created_at ? formatDate(project.created_at) : 'Active'}
                    </span>
                    {project.github_url && (
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                        🌐 Git Repo Available
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
