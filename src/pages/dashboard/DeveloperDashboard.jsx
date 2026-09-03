import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockProjects, mockRecommendations } from '../../data/mockData';
import { projectsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function DeveloperDashboard({ user }) {
  const toast = useToast();
  const navigate = useNavigate();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [extractionMeta, setExtractionMeta] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form specifications (auto-filled by extraction algorithm or manually described)
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
  });

  const myProjects = mockProjects.slice(0, 4);

  // Handle single upload of project report (PDF, DOCX, TXT)
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setIsExtracting(true);
    toast.info('Analyzing Report', `Extracting specifications from "${file.name}" with 3-Layer algorithm (RBIE + Aho-Corasick + TF-IDF)...`);

    try {
      const data = await projectsApi.extractFromDocument(file);
      if (data && data.extracted_fields) {
        const ef = data.extracted_fields;
        setForm({
          title: ef.title || '',
          description: ef.description || '',
          problemStatement: ef.problem_statement || '',
          objectives: ef.objectives || '',
          programmingLanguages: Array.isArray(ef.programming_languages) ? ef.programming_languages.join(', ') : '',
          frameworks: Array.isArray(ef.frameworks) ? ef.frameworks.join(', ') : '',
          databaseTech: Array.isArray(ef.database_tech) ? ef.database_tech.join(', ') : '',
          apisUsed: Array.isArray(ef.apis_used) ? ef.apis_used.join(', ') : '',
          aiMlTech: Array.isArray(ef.ai_ml_tech) ? ef.ai_ml_tech.join(', ') : '',
        });
        setExtractionMeta(data);
        toast.success('Extraction Complete!', data.extraction_summary || 'Extracted fields populated into columns below.');
      } else {
        toast.warning('Extraction Notice', 'Document analyzed, but no structured sections could be inferred.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Extraction Failed', err.message || 'Could not parse document. You can still describe specs manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Demo auto-fill preset
  const handleAutoFillDemo = () => {
    setForm({
      title: 'Enterprise Semantic Document Parser & RAG Knowledge Pipeline',
      description: 'An asynchronous document parsing and question answering microservice that ingests PDFs, parses structured tabular layouts, generates 512-dim vector embeddings, and stores them in FAISS for low-latency sub-millisecond retrieval.',
      problemStatement: 'Multiple engineering squads build isolated document chunking workers, duplicating database indexes and increasing licensing expenses by 40%.',
      objectives: '1. Ingest PDF and DOCX documents with layout detection\n2. Maintain dense FAISS vector index with sub-second retrieval\n3. Provide reusable embedding pipeline API',
      programmingLanguages: 'Python, SQL',
      frameworks: 'FastAPI, Celery, React 19',
      databaseTech: 'PostgreSQL, pgvector, Redis',
      apisUsed: 'OpenAI API, AWS S3',
      aiMlTech: 'Sentence-Transformers all-MiniLM-L6-v2, FAISS Index, LangChain',
    });
    setExtractionMeta({
      extraction_summary: 'Demo preset loaded (11 structured fields populated)',
      confidence: { title: 'high', description: 'high', problem_statement: 'high', tech_stack: 'high' },
    });
    toast.success('Demo Specs Loaded', 'Review the auto-populated columns below.');
  };

  // Proceed with vector similarity checking across the DB
  const handleProceedWithChecking = async (e) => {
    e?.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Missing Required Fields', 'Please ensure at least the Project Title and Description are populated.');
      return;
    }

    setIsScanning(true);
    toast.info('Vector Database Embedding Scan', 'Encoding specifications into 512-dim embedding space and executing FAISS similarity scan...');

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
        ai_ml_tech: splitTech(form.aiMlTech),
        status: 'active',
      };

      const response = await projectsApi.submit(payload);

      if (response && response.similarity_match_id) {
        toast.success('Vector Overlap Detected!', 'Redirecting to AI similarity breakdown...');
        navigate(`/similarity/${response.similarity_match_id}`);
      } else if (response && response.project) {
        toast.success('Project Ingested!', 'Proposal registered. Distinct architecture with no high duplicate risk.');
        navigate(`/projects/${response.project.id}`);
      } else {
        toast.success('Scan Completed', 'Project scanned successfully.');
        navigate('/similarity');
      }
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Scan Failed', err.message || 'Unable to complete vector scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const hasContent = form.title || form.description || form.programmingLanguages;

  return (
    <div className="page-enter">
      {/* Developer Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '2rem 2.5rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#6ee7b7',
              marginBottom: '0.75rem',
            }}>
              <span>💻</span> DEVELOPER WORKSPACE & AI REUSE HUB
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.35rem', color: '#f8fafc' }}>
              Welcome, <span className="text-gradient-cyber">{user?.firstName || 'Developer'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
              Upload your project report or enter architecture specs. Our FAISS vector engine checks the database for existing code modules and unlocks reusable downloads.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAutoFillDemo}
              style={{ fontSize: '0.85rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}
            >
              ⚡ Auto-Fill Demo Specs
            </button>
            <Link to="/similarity" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              🔍 View All Scans
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 PRIMARY INTAKE CARD: Single Upload of Report OR Describe Manually      */}
      {/* ========================================================================= */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2.5rem',
        border: '1px solid rgba(139, 92, 246, 0.45)',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%)',
        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header and Mode Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🚀</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Project Intake & Vector Similarity Checker
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Upload your project report to auto-extract specifications using our NLP algorithms, or directly fill in the architecture columns below.
            </p>
          </div>
        </div>

        {/* Upload Drop Zone or Uploaded File Banner */}
        <div style={{ marginBottom: '1.75rem' }}>
          {uploadedFile ? (
            <div style={{
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  📄
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                      {uploadedFile.name}
                    </h4>
                    <span className="badge badge-active" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399' }}>
                      ✓ Parsed
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Architecture specifications extracted via 3-layer NLP
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => document.getElementById('report-file-input').click()}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                >
                  🔄 Replace File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setExtractionMeta(null);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                  title="Clear uploaded file"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`file-upload-zone ${dragActive ? 'drag-over' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('report-file-input').click()}
              style={{
                padding: '2.25rem 1.5rem',
                background: dragActive ? 'rgba(124, 58, 237, 0.18)' : 'rgba(15, 23, 42, 0.65)',
                border: `2px dashed ${dragActive ? '#a78bfa' : 'rgba(139, 92, 246, 0.45)'}`,
                borderRadius: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: dragActive ? '0 0 25px rgba(139, 92, 246, 0.3)' : 'none',
              }}
            >
              <div style={{ fontSize: '2.6rem', marginBottom: '0.4rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
                📑
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.3rem' }}>
                Upload Project Report (PDF, DOCX, TXT)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto' }}>
                Drag & drop your architecture report here or click to browse. The 3-layer NLP engine will automatically extract and populate the input text boxes below.
              </div>

              {isExtracting && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#c4b5fd', fontSize: '0.88rem', fontWeight: 600 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Extracting specifications using Aho-Corasick & TF-IDF...
                </div>
              )}
            </div>
          )}

          <input
            id="report-file-input"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Algorithm Extraction Notice */}
        {extractionMeta && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.25) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '12px',
            padding: '0.9rem 1.4rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <span style={{ fontSize: '0.88rem', color: '#6ee7b7', fontWeight: 700 }}>
                {extractionMeta.extraction_summary || 'Specifications extracted into input boxes below.'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.7rem', borderRadius: '99px' }}>
              ⚡ <strong>RBIE</strong> + <strong>Aho-Corasick</strong> + <strong>TF-IDF</strong>
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ULTRA-MODERN SPECIFICATION TEXT BOXES                                    */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Box 1: Title & Description */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏷️</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    Project Identity & Abstract
                  </span>
                </div>
                {extractionMeta?.confidence?.title && (
                  <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                    ✦ Auto-Extracted
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Project Title <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Enterprise RAG Document Pipeline"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 29, 0.85)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    borderLeft: '4px solid #8b5cf6',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.35)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description / Architecture Abstract <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the architectural scope, core services, background workers, and technical capabilities..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 29, 0.85)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderLeft: '4px solid #6366f1',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                />
              </div>
            </div>
          </div>

          {/* Box 2: Problem Statement & Objectives */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🎯</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    Problem Statement & Goals
                  </span>
                </div>
                {extractionMeta?.confidence?.problem_statement && (
                  <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                    ✦ Inferred
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={form.problemStatement}
                  onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                  placeholder="What operational pain point, latency issue, or duplication problem does this solve?"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 29, 0.85)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(245, 158, 11, 0.3)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Objectives / Deliverables
                </label>
                <textarea
                  rows={3}
                  value={form.objectives}
                  onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  placeholder="1. Real-time document parsing&#10;2. Sub-second vector retrieval&#10;3. High-throughput queuing API"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 29, 0.85)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                />
              </div>
            </div>
          </div>

          {/* Box 3: Detected Technical Architecture */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🛠️</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    Detected Technical Stack
                  </span>
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                  Aho-Corasick Match
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    💻 Programming Languages
                  </label>
                  <input
                    type="text"
                    value={form.programmingLanguages}
                    onChange={(e) => setForm({ ...form, programmingLanguages: e.target.value })}
                    placeholder="e.g. Python, SQL, TypeScript"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(10, 15, 29, 0.85)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    ⚡ Frameworks & Libraries
                  </label>
                  <input
                    type="text"
                    value={form.frameworks}
                    onChange={(e) => setForm({ ...form, frameworks: e.target.value })}
                    placeholder="e.g. FastAPI, Celery, React 19"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(10, 15, 29, 0.85)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    🗄️ Database, Caching & Vector
                  </label>
                  <input
                    type="text"
                    value={form.databaseTech}
                    onChange={(e) => setForm({ ...form, databaseTech: e.target.value })}
                    placeholder="e.g. PostgreSQL, Redis, FAISS Index"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(10, 15, 29, 0.85)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    🤖 AI / ML Models & APIs
                  </label>
                  <input
                    type="text"
                    value={form.aiMlTech}
                    onChange={(e) => setForm({ ...form, aiMlTech: e.target.value })}
                    placeholder="e.g. Sentence-Transformers, LangChain, OpenAI"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(10, 15, 29, 0.85)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CALL TO ACTION: Proceed with Vector Similarity Checking Across DB        */}
        {/* ========================================================================= */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {hasContent ? (
              <span style={{ color: '#34d399' }}>✓ Specifications ready for FAISS vector embedding scan.</span>
            ) : (
              <span>Upload a project report or describe manually to populate columns.</span>
            )}
          </div>

          <button
            type="button"
            id="proceed-similarity-check-btn"
            className="btn btn-primary"
            disabled={isScanning || !hasContent}
            onClick={handleProceedWithChecking}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
              padding: '0.85rem 1.8rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isScanning ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Scanning Vector Database Embeddings...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Proceed with Vector Similarity Checking Across Database →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEVELOPER METRICS & RECENT SUBMISSIONS                                    */}
      {/* ========================================================================= */}
      <div className="stagger-children" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📁</div>
            <span className="badge badge-active">Active</span>
          </div>
          <div className="stat-card-value">{myProjects.length}</div>
          <div className="stat-card-label">My Submissions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">⚡</div>
            <span className="badge badge-sim-partial">+4 New</span>
          </div>
          <div className="stat-card-value">18</div>
          <div className="stat-card-label">Reusable Modules Available</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">⚠️</div>
            <span className="badge badge-pending">Flagged</span>
          </div>
          <div className="stat-card-value">2</div>
          <div className="stat-card-label">Duplicate Alerts Detected</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon teal">⏱️</div>
            <span className="badge badge-approved">Saved</span>
          </div>
          <div className="stat-card-value">340 hrs</div>
          <div className="stat-card-label">Development Time Saved</div>
        </div>
      </div>
    </div>
  );
}
