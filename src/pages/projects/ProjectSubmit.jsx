import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { projectsApi, similarityApi } from '../../services/api';

export default function ProjectSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMeta, setExtractionMeta] = useState(null);
  const [codeVerification, setCodeVerification] = useState(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeFiles, setCodeFiles] = useState([]);
  const [expandedSnippet, setExpandedSnippet] = useState(null);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    problemStatement: '',
    objectives: '',
    programmingLanguages: '',
    frameworks: '',
    databaseTech: '',
    apisUsed: '',
    aiMlTech: '',
    status: 'active',
    githubUrl: '',
    documentationUrl: '',
  });

  // Demo auto-fill preset
  const handleAutoFillDemo = () => {
    setForm({
      title: 'Real-time Intelligent Document Extraction & Semantic RAG Pipeline',
      description: 'An enterprise microservice system for automated parsing of unstructured PDF/DOCX contracts and enterprise reports using sentence-transformers, FAISS vector indexing, and asynchronous queue processing.',
      problemStatement: 'Multiple operational teams manually extract clauses and metadata from 10,000+ monthly vendor agreements, creating high latency and duplicated parsing logic.',
      objectives: '1. Reduce document ingestion latency by 85%\n2. Extract standardized entities with >96% accuracy\n3. Provide reusable vector embedding API for other internal teams',
      programmingLanguages: 'Python, TypeScript, SQL',
      frameworks: 'FastAPI, LangChain, React 19, Celery',
      databaseTech: 'PostgreSQL 16, pgvector, Redis Cluster',
      apisUsed: 'OpenAI Embeddings API, AWS S3, Internal SSO OAuth2',
      aiMlTech: 'Sentence-Transformers all-MiniLM-L6-v2, FAISS Index, Llama-3-70B',
      status: 'active',
      githubUrl: 'https://github.com/enterprise-org/doc-ai-pipeline',
      documentationUrl: 'https://docs.enterprise.internal/services/doc-rag',
    });
    setFiles([
      { name: 'Architecture_Design_v2.1.pdf', size: 2457600 },
      { name: 'Schema_Specification_v1.docx', size: 1048576 },
    ]);
    toast.success('Enterprise Preset Loaded', 'Live demo data auto-populated. Ready for AI vector scan.');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExtractDocument = async (fileToExtract) => {
    const target = fileToExtract || files[0];
    if (!target) {
      toast.error('No Document', 'Please select or upload a document first.');
      return;
    }

    setIsExtracting(true);
    toast.info('Document Analyzer', `Parsing "${target.name}" with 3-Layer RBIE (Regex + Aho-Corasick + TF-IDF)...`);

    try {
      const data = await projectsApi.extractFromDocument(target);
      if (data && data.extracted_fields) {
        const ef = data.extracted_fields;
        
        // Auto-fill fields (fill empty fields or merge tech stacks)
        setForm(prev => ({
          ...prev,
          title: ef.title || prev.title,
          description: ef.description || prev.description,
          problemStatement: ef.problem_statement || prev.problemStatement,
          objectives: ef.objectives || prev.objectives,
          programmingLanguages: Array.isArray(ef.programming_languages) && ef.programming_languages.length > 0 
            ? ef.programming_languages.join(', ') 
            : prev.programmingLanguages,
          frameworks: Array.isArray(ef.frameworks) && ef.frameworks.length > 0 
            ? ef.frameworks.join(', ') 
            : prev.frameworks,
          databaseTech: Array.isArray(ef.database_tech) && ef.database_tech.length > 0 
            ? ef.database_tech.join(', ') 
            : prev.databaseTech,
          apisUsed: Array.isArray(ef.apis_used) && ef.apis_used.length > 0 
            ? ef.apis_used.join(', ') 
            : prev.apisUsed,
          aiMlTech: Array.isArray(ef.ai_ml_tech) && ef.ai_ml_tech.length > 0 
            ? ef.ai_ml_tech.join(', ') 
            : prev.aiMlTech,
          githubUrl: ef.github_url || prev.githubUrl,
          documentationUrl: ef.documentation_url || prev.documentationUrl,
        }));

        setExtractionMeta({
          summary: data.extraction_summary,
          confidence: data.confidence || {},
          rawPreview: data.raw_text_preview,
          extractedFields: ef,
          fileName: target.name,
        });

        toast.success('Document Extracted!', data.extraction_summary || 'Fields populated into proposal form. You can review or edit manually.');

        // Asynchronously check against real project codebase in database
        setIsVerifyingCode(true);
        similarityApi.verifyPdfAgainstCode(target).then((codeRes) => {
          if (codeRes && codeRes.matching_segments && codeRes.matching_segments.length > 0) {
            setCodeVerification(codeRes);
            toast.info('Codebase Overlap Found!', `Identified ${codeRes.matching_segments.length} matching code functions/classes in database!`);
          }
        }).catch((err) => {
          console.warn('Code verification notice:', err);
        }).finally(() => {
          setIsVerifyingCode(false);
        });
      } else {
        toast.warning('Extraction Notice', 'Document analyzed, but no structured sections could be inferred.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Extraction Error', err.message || 'Failed to extract details from document. You can still enter details manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected].slice(0, 5));
      if (!form.title.trim() && !form.description.trim()) {
        handleExtractDocument(selected[0]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped].slice(0, 5));
      if (!form.title.trim() && !form.description.trim()) {
        handleExtractDocument(dropped[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Validation Error', 'Project title and description are required');
      return;
    }

    setLoading(true);

    const splitTech = (val) => {
      if (Array.isArray(val)) return val;
      if (!val) return [];
      return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      problem_statement: form.problemStatement?.trim() || '',
      objectives: form.objectives?.trim() || '',
      programming_languages: splitTech(form.programmingLanguages),
      frameworks: splitTech(form.frameworks),
      database_tech: splitTech(form.databaseTech),
      apis_used: splitTech(form.apisUsed),
      ai_ml_tech: splitTech(form.aiMlTech),
      status: form.status || 'active',
      github_url: form.githubUrl?.trim() || null,
      documentation_url: form.documentationUrl?.trim() || null,
    };

    try {
      toast.info('Ingestion', 'Registering proposal and generating vector embeddings...');
      const response = await projectsApi.submit(payload);

      toast.info('FAISS Vector Search', 'Scanning cross-project embeddings for duplicate components...');
      await new Promise((r) => setTimeout(r, 600));

      // If source code folder or ZIP is attached, upload and segment into AST
      if (response && response.project && codeFiles.length > 0) {
        toast.info('Code Ingestion', 'Uploading codebase and extracting AST functions/classes...');
        try {
          const zipFile = codeFiles.find(f => f.name.toLowerCase().endsWith('.zip'));
          if (zipFile) {
            await projectsApi.uploadCodebase(response.project.id, zipFile);
          } else {
            const fd = new FormData();
            codeFiles.forEach(f => {
              fd.append('files', f);
              fd.append('paths', f.webkitRelativePath || f.name);
            });
            await projectsApi.uploadCodebase(response.project.id, fd);
          }
          toast.success('Codebase Indexed', 'Source code segmented and indexed into FAISS code database!');
        } catch (codeErr) {
          console.warn('Codebase upload warning:', codeErr);
        }
      }

      if (response && response.similarity_match_id) {
        toast.success('Vector Overlap Detected!', 'Redirecting to AI similarity breakdown & reuse recommendations...');
        navigate(`/similarity/${response.similarity_match_id}`);
      } else if (response && response.project) {
        toast.success('Project Submitted!', 'Proposal registered. Distinct architecture with no high duplicate risk.');
        navigate(`/projects/${response.project.id}`);
      } else {
        toast.success('Submission Complete', 'Project proposal registered.');
        navigate('/projects');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Submission Failed', err.message || 'Unable to submit proposal.');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const renderConfidenceBadge = (fieldName) => {
    if (!extractionMeta?.confidence?.[fieldName]) return null;
    const conf = extractionMeta.confidence[fieldName];
    const color = conf === 'high' ? '#34d399' : conf === 'medium' ? '#fbbf24' : '#fb923c';
    return (
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        color: color,
        marginLeft: '0.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '0.15rem 0.45rem',
        borderRadius: '4px',
        border: `1px solid ${color}50`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}>
        ✦ Auto-Extracted ({conf})
      </span>
    );
  };

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-header-row" style={{ alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#c4b5fd',
              marginBottom: '0.5rem',
            }}>
              <span>✦</span> AI INGESTION & VECTOR SCANNER
            </div>
            <h1 className="page-title">Submit Project Proposal</h1>
            <p className="page-subtitle">
              Register architecture specs manually or upload a project report (PDF, DOCX, TXT) for automatic extraction via RBIE, Aho-Corasick & TF-IDF algorithms.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAutoFillDemo}
            style={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              background: 'rgba(124, 58, 237, 0.15)',
              color: '#c4b5fd',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.25)',
              fontSize: '0.875rem'
            }}
          >
            ⚡ Auto-Fill Enterprise Demo Data
          </button>
        </div>
      </div>

      {extractionMeta && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 95, 70, 0.18) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem' }}>✨</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>
                  Auto-Extracted from "{extractionMeta.fileName}"
                </span>
                <span className="badge badge-active" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', borderColor: '#059669' }}>
                  {extractionMeta.summary}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                <strong style={{ color: '#e2e8f0' }}>Algorithms applied:</strong> 3-Layer Rule-Based Information Extraction (RBIE) • Aho-Corasick Multi-Pattern Automaton (200+ Tech Dictionary) • TF-IDF Scorer (Paragraph Relevance).
                <span style={{ marginLeft: '0.5rem', color: '#6ee7b7' }}>You can review and edit all fields manually below.</span>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setExtractionMeta(null)}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', height: 'auto' }}
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Real Codebase Verification Card */}
      {codeVerification && codeVerification.matching_segments?.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.5) 100%)',
          border: '1px solid rgba(96, 165, 250, 0.4)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>💻</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#93c5fd' }}>
                    Real Codebase Verification: Matching Code Found in Database
                  </h4>
                  <span className="badge badge-active" style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', borderColor: '#3b82f6', fontSize: '0.7rem' }}>
                    FAISS Code Search
                  </span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  FAISS cross-referenced your document requirements against real executable code stored in other projects.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                ✦ {codeVerification.highest_code_overlap_score}% Highest Code Match
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                ⏱️ {codeVerification.estimated_hours_saved} Hours Reusable
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '0.75rem' }}>
            {codeVerification.matching_segments.map((seg, idx) => (
              <div key={idx} style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#60a5fa',
                    }}>
                      {seg.segment_type === 'class' ? '🏛️' : '⚡'} {seg.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                      {seg.similarity_score}% match
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem', wordBreak: 'break-all' }}>
                    📂 {seg.file_path} (Lines {seg.start_line}–{seg.end_line})
                  </div>
                  {seg.signature && (
                    <div style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#cbd5e1',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                    }}>
                      {seg.signature}
                    </div>
                  )}
                  {seg.docstring && (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0', fontStyle: 'italic', lineHeight: 1.3 }}>
                      "{seg.docstring.slice(0, 90)}..."
                    </p>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedSnippet(expandedSnippet === idx ? null : idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#93c5fd',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {expandedSnippet === idx ? '▲ Hide Code Lines' : '▼ View Real Code Lines'}
                  </button>
                  {expandedSnippet === idx && (
                    <pre style={{
                      marginTop: '0.5rem',
                      padding: '0.6rem',
                      background: '#090d16',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      color: '#e2e8f0',
                      overflowX: 'auto',
                      maxHeight: '160px',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.4,
                    }}>
                      {seg.code_content}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          {/* Left Column — Main Specs */}
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Step 1: Core Specifications */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="detail-section-title" style={{ margin: 0, paddingBottom: '0.5rem' }}>
                  <span>📋</span> Core Architectural Specifications
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Step 1 / 3</span>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  Project Name / Working Title <span className="required">*</span>
                  {renderConfidenceBadge('title')}
                </label>
                <input
                  name="title"
                  className="form-input"
                  placeholder="e.g., Cross-Platform Intelligent Document Processing Hub"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  Detailed System Description <span className="required">*</span>
                  {renderConfidenceBadge('description')}
                </label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Comprehensive description of the project architecture, target data flow, and services..."
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  Problem Statement
                  {renderConfidenceBadge('problem_statement')}
                </label>
                <textarea
                  name="problemStatement"
                  className="form-input form-textarea"
                  placeholder="What specific technical/business bottleneck does this project address?"
                  rows={3}
                  value={form.problemStatement}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Core Objectives & Key Deliverables
                  {renderConfidenceBadge('objectives')}
                </label>
                <textarea
                  name="objectives"
                  className="form-input form-textarea"
                  placeholder="Primary milestones and technical metrics (one per line)"
                  rows={3}
                  value={form.objectives}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Step 2: Technology Stack Fingerprint */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="detail-section-title" style={{ margin: 0, paddingBottom: '0.5rem' }}>
                  <span>⚡</span> Technology Stack Fingerprint
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Step 2 / 3</span>
              </div>

              <div className="detail-grid mb-4">
                <div className="form-group">
                  <label className="form-label">
                    Programming Languages
                    {renderConfidenceBadge('programming_languages')}
                  </label>
                  <input
                    name="programmingLanguages"
                    className="form-input"
                    placeholder="e.g., Python, TypeScript, Go"
                    value={form.programmingLanguages}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Frameworks & Libraries
                    {renderConfidenceBadge('frameworks')}
                  </label>
                  <input
                    name="frameworks"
                    className="form-input"
                    placeholder="e.g., FastAPI, React 19, PyTorch"
                    value={form.frameworks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="detail-grid mb-4">
                <div className="form-group">
                  <label className="form-label">
                    Database & Storage
                    {renderConfidenceBadge('database_tech')}
                  </label>
                  <input
                    name="databaseTech"
                    className="form-input"
                    placeholder="e.g., PostgreSQL, pgvector, Redis"
                    value={form.databaseTech}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    APIs & Integrations
                    {renderConfidenceBadge('apis_used')}
                  </label>
                  <input
                    name="apisUsed"
                    className="form-input"
                    placeholder="e.g., OpenAI API, AWS S3, Stripe"
                    value={form.apisUsed}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  AI/ML & Vector Engine
                  {renderConfidenceBadge('ai_ml_tech')}
                </label>
                <input
                  name="aiMlTech"
                  className="form-input"
                  placeholder="e.g., Sentence-Transformers, FAISS, Llama-3-70B"
                  value={form.aiMlTech}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Step 3: Repositories & Docs */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="detail-section-title" style={{ margin: 0, paddingBottom: '0.5rem' }}>
                  <span>🔗</span> Repository & Architecture Specs
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Step 3 / 3</span>
              </div>

              <div className="detail-grid">
                <div className="form-group">
                  <label className="form-label">
                    GitHub / Git Repository URL
                    {renderConfidenceBadge('github_url')}
                  </label>
                  <input
                    name="githubUrl"
                    className="form-input"
                    placeholder="https://github.com/organization/repo"
                    value={form.githubUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Architecture Docs / Confluence URL
                    {renderConfidenceBadge('documentation_url')}
                  </label>
                  <input
                    name="documentationUrl"
                    className="form-input"
                    placeholder="https://docs.internal/projects/hub"
                    value={form.documentationUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Control Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 'calc(var(--topnav-height) + 1.5rem)' }}>
            
            {/* Status Selector */}
            <div className="detail-section">
              <h3 className="detail-section-title">📊 Proposal Phase</h3>
              <div className="form-group">
                <select
                  name="status"
                  className="form-input form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft Proposal</option>
                  <option value="active">Active Architecture Review</option>
                  <option value="completed">Production Ready</option>
                </select>
              </div>
            </div>

            {/* Drag and drop upload */}
            <div className="detail-section">
              <h3 className="detail-section-title">📎 Architecture Artifacts</h3>
              <div
                className={`file-upload ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <div className="file-upload-icon">📄</div>
                <div className="file-upload-text">
                  <span className="file-upload-highlight">Click to upload</span> or drag PRDs
                </div>
                <div className="file-upload-hint">PDF, DOCX, TXT (up to 5 files, 10MB each)</div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>

              {files.length > 0 && (
                <>
                  <div className="file-list">
                    {files.map((file, i) => (
                      <div key={i} className="file-item">
                        <span className="file-item-icon">📑</span>
                        <span className="file-item-name">{file.name}</span>
                        <span className="file-item-size">{formatSize(file.size)}</span>
                        <button
                          type="button"
                          title="Extract details from this file"
                          onClick={(e) => { e.stopPropagation(); handleExtractDocument(file); }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#34d399',
                            cursor: 'pointer',
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          ⚡ Extract
                        </button>
                        <button type="button" className="file-item-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>✕</button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary w-full"
                    disabled={isExtracting}
                    onClick={() => handleExtractDocument()}
                    style={{
                      marginTop: '0.85rem',
                      borderColor: 'rgba(52, 211, 153, 0.4)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#6ee7b7',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    {isExtracting ? (
                      <>
                        <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        <span>Parsing with Aho-Corasick & TF-IDF...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Auto-Extract Details with AI</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Source Codebase Ingestion Card */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 className="detail-section-title" style={{ margin: 0, paddingBottom: 0 }}>
                  <span>💻</span> Project Source Codebase
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>AST Indexer</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                Attach project source code (folder or .zip archive). The AST segmenter extracts functions & classes into the FAISS code vector database.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => document.getElementById('code-folder-input').click()}
                  style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                  }}
                >
                  📁 Select Source Code Folder
                </button>
                <input
                  id="code-folder-input"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const selected = Array.from(e.target.files);
                    setCodeFiles(selected);
                    toast.success('Codebase Selected', `Selected ${selected.length} source code files for AST indexing.`);
                  }}
                />

                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => document.getElementById('code-zip-input').click()}
                  style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                  }}
                >
                  📦 Select Codebase ZIP Archive
                </button>
                <input
                  id="code-zip-input"
                  type="file"
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const zip = e.target.files[0];
                    if (zip) {
                      setCodeFiles([zip]);
                      toast.success('ZIP Archive Selected', `Attached "${zip.name}" for AST segmentation & FAISS indexing.`);
                    }
                  }}
                />
              </div>

              {codeFiles.length > 0 && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#93c5fd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>✓ {codeFiles.length === 1 && codeFiles[0].name.endsWith('.zip') ? `ZIP: ${codeFiles[0].name}` : `${codeFiles.length} source files ready to ingest`}</span>
                  <button
                    type="button"
                    onClick={() => setCodeFiles([])}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    ✕ Clear
                  </button>
                </div>
              )}
            </div>

            {/* Ready to Analyze Action Card */}
            <div className="detail-section" style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc', margin: 0 }}>
                  Ready to Run AI Scan?
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Our FAISS vector engine will compute embeddings and search across cross-team repositories to detect overlaps and compute ROI savings.
              </p>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
                style={{ padding: '0.9rem 1.5rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Running Vector Matcher...
                  </span>
                ) : (
                  '⚡ Submit & Run Semantic AI Scan'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
