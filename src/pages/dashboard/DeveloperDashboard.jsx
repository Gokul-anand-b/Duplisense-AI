import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi, similarityApi, approvalsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function DeveloperDashboard({ user }) {
  const toast = useToast();
  const navigate = useNavigate();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [extractionMeta, setExtractionMeta] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [noMatchProject, setNoMatchProject] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(true);

  // Approval Request State for Developer
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('not_requested');
  const [targetScanForApproval, setTargetScanForApproval] = useState(null);

  const handleOpenApprovalModal = (scan = null) => {
    const target = scan || scanResult;
    setTargetScanForApproval(target);
    const similarTitle = target?.similar_project?.title || 'Baseline Project';
    setApprovalNotes(`Developer requested Git repository and source code access for: ${similarTitle}`);
    setShowApprovalModal(true);
  };

  const loadRecentScans = async () => {
    try {
      setLoadingScans(true);
      const [scansData, projectsData] = await Promise.all([
        similarityApi.getAll().catch(() => []),
        projectsApi.getAll().catch(() => []),
      ]);

      const scansList = Array.isArray(scansData) ? scansData : [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];

      // Active proposals submitted by developer (exclude baseline completed project #7)
      const activeProposals = projectsList.filter(p => p.status === 'active' && p.id !== 7);

      const combined = activeProposals.map(p => {
        const sim = scansList.find(s => (s.source_project?.id || s.source_project) === p.id);
        return {
          id: p.id,
          project: p,
          simResult: sim || null,
          hasMatch: !!sim,
          title: p.title,
          matchedTitle: sim?.similar_project?.title || '— None (Unique Proposal)',
          similarityScore: sim ? (sim.similarity_score ?? 0) : 0,
          isUnlocked: sim ? (sim.is_unlocked || sim.approval_status === 'approved') : false,
          isPending: sim ? sim.approval_status === 'pending' : false,
          githubUrl: sim?.similar_project?.github_url,
          simId: sim?.id,
        };
      });

      setRecentScans(combined);
    } catch (err) {
      console.warn('Could not fetch recent scans:', err);
    } finally {
      setLoadingScans(false);
    }
  };

  // Delete a single scan/proposal record
  const handleDeleteScan = async (scan) => {
    if (!window.confirm(`Are you sure you want to delete scan/proposal "${scan.title}"?`)) {
      return;
    }
    try {
      if (scan.id) {
        await projectsApi.delete(scan.id);
      } else if (scan.simId) {
        await similarityApi.delete(scan.simId);
      }
      setRecentScans((prev) => prev.filter((item) => item.id !== scan.id && item.simId !== scan.simId));
      if (scanResult && (scanResult.id === scan.simId || scanResult.source_project?.id === scan.id)) {
        setScanResult(null);
      }
      if (noMatchProject && noMatchProject.id === scan.id) {
        setNoMatchProject(null);
      }
      toast.success('Deleted', `Scan "${scan.title}" removed successfully.`);
    } catch (err) {
      console.error('Failed to delete scan:', err);
      toast.error('Delete Failed', err.message || 'Could not delete scan.');
    }
  };

  // Clear all recent scans
  const handleClearAllScans = async () => {
    if (recentScans.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ALL ${recentScans.length} recent proposal scans? This cannot be undone.`)) {
      return;
    }
    try {
      for (const scan of recentScans) {
        if (scan.id) {
          await projectsApi.delete(scan.id).catch(() => {});
        } else if (scan.simId) {
          await similarityApi.delete(scan.simId).catch(() => {});
        }
      }
      setRecentScans([]);
      setScanResult(null);
      setNoMatchProject(null);
      toast.success('All Scans Cleared', 'All recent proposal records have been deleted.');
    } catch (err) {
      console.error('Failed to clear scans:', err);
      toast.error('Clear Failed', err.message);
    }
  };

  const handleSendApprovalRequest = async () => {
    const target = targetScanForApproval || scanResult;
    if (!target) return;
    try {
      setIsSubmittingApproval(true);
      const similarTitle = target.similar_project?.title || 'Baseline Project';
      const matchedTech = target.matched_technologies?.slice(0, 4).join(', ') || 'Authentication, Express Routes & Database Pool';
      await approvalsApi.requestReuse({
        similarity_id: target.id,
        notes: approvalNotes || `Developer requested Git repository and source code access for: ${similarTitle}`,
        requested_modules: matchedTech,
        hours_saved: 160,
      });
      toast.success('Request Sent to Manager!', 'Engineering Manager has been notified to review and unlock the Git repository.');
      setApprovalStatus('pending');
      setShowApprovalModal(false);

      if (scanResult && scanResult.id === target.id) {
        setScanResult(prev => ({ ...prev, approval_status: 'pending' }));
      }
      loadRecentScans();
    } catch (err) {
      toast.error('Request Failed', err.message || 'Unable to submit approval request.');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // 4 Required Fields + Tech Stack
  const [form, setForm] = useState({
    title: '',
    description: '',
    problemStatement: '',
    objectives: '',
    programmingLanguages: '',
    frameworks: '',
    databaseTech: '',
    apisUsed: '',
  });

  // Fetch real recent scans from the database
  useEffect(() => {
    loadRecentScans();
  }, []);

  // Handle file upload of project report (PDF, DOCX, TXT)
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setIsExtracting(true);
    setScanResult(null);
    toast.info('Extracting Report Specs', `Parsing "${file.name}" with 3-Layer algorithm (RBIE + Aho-Corasick + TF-IDF)...`);

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
        });
        setExtractionMeta(data);
        toast.success('Extraction Complete!', data.extraction_summary || 'Review and verify the extracted specifications below.');
      } else {
        toast.warning('Extraction Notice', 'Document analyzed, but no sections could be inferred. Please fill manually.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Extraction Failed', err.message || 'Could not parse document. You can describe specs manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // 1-Click quick load of sample test proposals
  const handleQuickLoadSample = async (filename, label) => {
    toast.info('Loading Test Proposal', `Fetching "${label}"...`);
    try {
      const resp = await fetch(`/demo_documents/${filename}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
      await handleFileUpload(file);
    } catch (err) {
      toast.error('Load Failed', err.message);
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

  // Run semantic vector search against existing projects in the Vector Database
  const handleRunSemanticSearch = async (e) => {
    e?.preventDefault();

    // Validate 4 required fields
    if (!form.title.trim()) {
      toast.error('Validation Error', 'Project Title is required.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Validation Error', 'System Description is required.');
      return;
    }
    if (!form.problemStatement.trim()) {
      toast.error('Validation Error', 'Problem Statement is required.');
      return;
    }
    if (!form.objectives.trim()) {
      toast.error('Validation Error', 'Core Objectives are required.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    toast.info('Running Vector Search', 'Encoding specifications into 512-dim embedding space and querying FAISS Vector DB...');

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
        status: 'active',
      };

      const response = await projectsApi.submit(payload);

      if (response && response.similarity_match_id) {
        // Fetch full similarity details
        const simData = await similarityApi.getById(response.similarity_match_id);
        setScanResult(simData);
        setNoMatchProject(null);
        setApprovalStatus(simData.approval_status || (simData.is_unlocked ? 'approved' : 'not_requested'));
        toast.success('Vector Search Complete: Overlap Found!', `Proposal matched existing project with ${simData.similarity_score}% overlap.`);
        loadRecentScans();
      } else if (response && response.project) {
        setScanResult(null);
        setNoMatchProject(response.project);
        toast.success('Vector Search Complete: Original Project!', 'No matching duplicate records found in database. 100% original architecture.');
        loadRecentScans();
      } else {
        setScanResult(null);
        setNoMatchProject(null);
        toast.info('Scan Completed', 'No matching records found.');
        loadRecentScans();
      }
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Scan Failed', err.message || 'Unable to execute vector search.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Developer Header Banner */}
      <div style={{
        padding: '2rem 2.5rem',
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
              <span>💻</span> DEVELOPER WORKSPACE
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.35rem 0', color: '#ffffff' }}>
              Welcome, <span className="text-gradient-cyber">{user?.firstName || 'Developer'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
              Upload your project report to auto-extract specifications, run a semantic vector search against existing completed projects, and request manager approval to unlock source code.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/similarity" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              📊 View All Past Scans
            </Link>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL / BANNER: Results Ready */}
      {scanResult && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 95, 70, 0.35) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.25)',
          animation: 'fadeIn 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <h3 style={{ margin: 0, color: '#6ee7b7', fontSize: '1.25rem', fontWeight: 800 }}>
                Semantic Vector Search Complete! Match Found
              </h3>
              <span className="badge badge-approved" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                {scanResult.similarity_score}% Similarity Match
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', color: '#a7f3d0', fontSize: '0.92rem', maxWidth: '700px', lineHeight: 1.5 }}>
              Matched against existing completed project: <strong>"{scanResult.similar_project?.title}"</strong>.
              Review the architectural overlap, code segments, and request manager approval to access the repository.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {scanResult.is_unlocked || approvalStatus === 'approved' ? (
              <a
                href={scanResult.similar_project?.github_url || 'https://github.com/Gokul-anand-b/real-estate-portal'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                  padding: '0.85rem 1.6rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                <span>🔓</span> Git Repo Unlocked (Open ↗)
              </a>
            ) : approvalStatus === 'pending' || scanResult.approval_status === 'pending' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleOpenApprovalModal(scanResult)}
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  borderColor: 'rgba(245, 158, 11, 0.5)',
                  color: '#fbbf24',
                  padding: '0.85rem 1.4rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px',
                }}
              >
                <span>⏳</span> Pending Review (Update Note)
              </button>
            ) : (
              <button
                type="button"
                id="send-approval-manager-btn"
                className="btn btn-primary"
                onClick={() => handleOpenApprovalModal(scanResult)}
                style={{
                  padding: '0.85rem 1.6rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px',
                }}
              >
                <span>📬</span> Send Request to Manager
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/similarity/${scanResult.id}`)}
              style={{
                padding: '0.85rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
              }}
            >
              <span>🚀</span> Go to Results & Check Overlap →
            </button>
          </div>
        </div>
      )}

      {/* NO MATCH BANNER: 100% Unique Architecture */}
      {noMatchProject && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.55)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.2)',
          animation: 'fadeIn 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.25rem', fontWeight: 800 }}>
                Vector Search Complete: No Matching Records Found!
              </h3>
              <span className="badge" style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                100% Original Architecture
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '720px', lineHeight: 1.5 }}>
              Proposal <strong>"{noMatchProject.title}"</strong> was scanned against all existing projects in the FAISS Vector Database. No semantic keyword matches or duplicate architectures were detected. Your project is completely unique and ready for implementation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to={`/projects/${noMatchProject.id}`}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <span>📄</span> View Registered Proposal Details →
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: REPORT UPLOAD DROPZONE */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Upload Project Report (PDF, DOCX, TXT)
              </h3>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Step 1: Auto-Extract</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Upload your architecture document or design specification. Our 3-layer extraction engine will automatically parse and populate the 4 required fields.
            </p>
          </div>

          {/* Quick Test Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Quick Test:</span>
            <button
              type="button"
              onClick={() => handleQuickLoadSample('Real_Estate_Property_Management_Portal.docx', 'Real Estate Portal DOCX')}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📄 Real Estate Portal (.docx)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLoadSample('Enterprise_RAG_Document_Pipeline.pdf', 'RAG Pipeline PDF')}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#a5b4fc',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📑 RAG Pipeline (.pdf)
            </button>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('report-file-input').click()}
          style={{
            border: `2px dashed ${dragActive ? '#10b981' : 'rgba(139, 92, 246, 0.45)'}`,
            borderRadius: '12px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: dragActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            id="report-file-input"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          />
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {isExtracting ? '⏳' : uploadedFile ? '✅' : '📥'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            {isExtracting ? (
              <span style={{ color: '#34d399' }}>Extracting sections with RBIE & Tech Dictionaries...</span>
            ) : uploadedFile ? (
              <span style={{ color: '#6ee7b7' }}>Uploaded: {uploadedFile.name}</span>
            ) : (
              <span>Click to browse or drag & drop project report file</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Supported formats: PDF, DOCX, TXT (Maximum 15MB)
          </div>
        </div>

        {extractionMeta && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: '#6ee7b7',
          }}>
            <span>✨</span>
            <span>{extractionMeta.extraction_summary || 'Fields extracted successfully. Review and edit the 4 required specifications below.'}</span>
          </div>
        )}
      </div>

      {/* STEP 2: REVIEW 4 REQUIRED FIELDS & RUN VECTOR SEARCH */}
      <form onSubmit={handleRunSemanticSearch}>
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Project Proposal Specifications
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Review the extracted information. All 4 core fields are required before semantic vector search can run.
              </p>
            </div>
            <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Step 2: Review & Search</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {/* Required Field 1: Title */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Project Title <span style={{ color: '#ef4444' }}>* (Required)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Modern Real Estate Property Management and Rental Portal"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Required Field 2: Description */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Detailed System Description <span style={{ color: '#ef4444' }}>* (Required)</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="Comprehensive description of the proposed system architecture, core functionality, and workflows..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* Required Field 3: Problem Statement */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Problem Statement <span style={{ color: '#ef4444' }}>* (Required)</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="What specific technical or operational problem does this project solve?"
                value={form.problemStatement}
                onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                required
              />
            </div>

            {/* Required Field 4: Objectives */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                4. Core Objectives & Deliverables <span style={{ color: '#ef4444' }}>* (Required)</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="Key goals, deliverables, and technical capabilities (one per line)..."
                value={form.objectives}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                required
              />
            </div>

            {/* Tech Stack Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Programming Languages</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. JavaScript, Python, SQL"
                  value={form.programmingLanguages}
                  onChange={(e) => setForm({ ...form, programmingLanguages: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Frameworks & Libraries</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Node.js, Express, React"
                  value={form.frameworks}
                  onChange={(e) => setForm({ ...form, frameworks: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Database & Storage</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MySQL, PostgreSQL, Redis"
                  value={form.databaseTech}
                  onChange={(e) => setForm({ ...form, databaseTech: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>APIs & Authentication</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. REST API, JWT Auth, Multer"
                  value={form.apisUsed}
                  onChange={(e) => setForm({ ...form, apisUsed: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Action Button: Run Semantic Search */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {form.title && form.description && form.problemStatement && form.objectives ? (
                <span style={{ color: '#34d399' }}>✓ All 4 required fields filled. Ready for Vector Search.</span>
              ) : (
                <span>Please complete the 4 required fields above.</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isScanning || !form.title || !form.description || !form.problemStatement || !form.objectives}
              style={{
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRadius: '8px',
              }}
            >
              {isScanning ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Searching Vector Database (FAISS)...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Run Semantic Vector Search Against Database →</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* REAL RECENT PROPOSALS & SCANS TABLE (NO DUMMY DATA) */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🗂️</span> Recent Proposal Scans in Database
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              Inspect similarity, request manager repository access, or delete unwanted scans
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
              {recentScans.length} Active Records
            </span>
            {recentScans.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllScans}
                className="btn btn-danger btn-sm"
                title="Delete all recent scans from database"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <span>🗑️</span> Clear All
              </button>
            )}
          </div>
        </div>

        {loadingScans ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Loading database records...</span>
          </div>
        ) : recentScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#a1a1aa' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              No proposals scanned yet. Upload your first project report above to test semantic similarity.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#a1a1aa' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Submitted Proposal</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Matched Baseline Project</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Similarity Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Repo Access</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => {
                  const hasMatch = scan.hasMatch;
                  const isUnlocked = scan.isUnlocked;
                  const isPending = scan.isPending;
                  return (
                    <tr key={scan.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ffffff', maxWidth: '280px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {scan.title}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: hasMatch ? '#ffffff' : '#71717a' }}>
                        {scan.matchedTitle}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {hasMatch ? (
                          <span className={`badge ${scan.similarityScore >= 75 ? 'badge-sim-high' : 'badge-sim-medium'}`} style={{ fontWeight: 700 }}>
                            {scan.similarityScore}% Match
                          </span>
                        ) : (
                          <span className="badge badge-approved" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', fontWeight: 700 }}>
                            0% (Original)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {hasMatch ? (
                          isUnlocked ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span className="badge badge-approved" style={{ fontSize: '0.72rem', fontWeight: 700 }}>🔓 Unlocked</span>
                              {scan.githubUrl && (
                                <a
                                  href={scan.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: '0.75rem', color: '#34d399', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  ↗ Git Repo
                                </a>
                              )}
                            </div>
                          ) : isPending ? (
                            <span className="badge badge-pending" style={{ fontSize: '0.72rem', fontWeight: 700 }}>⏳ Manager Pending</span>
                          ) : (
                            <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              🔒 Locked
                            </span>
                          )
                        ) : (
                          <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 700 }}>
                            ✨ 100% Unique
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          {hasMatch && !isUnlocked && !isPending && (
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalModal(scan.simResult)}
                              className="btn btn-primary"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              <span>📬</span> Request
                            </button>
                          )}
                          {hasMatch && isPending && (
                            <button
                              type="button"
                              onClick={() => handleOpenApprovalModal(scan.simResult)}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#fbbf24' }}
                            >
                              ⏳ Pending
                            </button>
                          )}
                          {hasMatch ? (
                            <Link
                              to={`/similarity/${scan.simId}`}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
                            >
                              {isUnlocked ? 'View Code →' : 'Overlap →'}
                            </Link>
                          ) : (
                            <Link
                              to={`/projects/${scan.id}`}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
                            >
                              View Proposal →
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteScan(scan)}
                            className="btn btn-danger btn-sm"
                            title="Delete this scan from database"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.65rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span>🗑️</span> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Reuse Request Modal */}
      {showApprovalModal && (
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
                  Request Git Repository Access
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Your proposal matches completed project <strong>"{targetScanForApproval?.similar_project?.title || scanResult?.similar_project?.title || 'Real Estate Portal'}"</strong> ({targetScanForApproval?.similarity_score || scanResult?.similarity_score}% overlap). Submit a request to the Engineering Manager to review and unlock the GitHub repository and source code.
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                Message to Engineering Manager
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Explain the reuse justification and modules needed..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                id="submit-approval-request-btn"
                className="btn btn-primary"
                onClick={handleSendApprovalRequest}
                disabled={isSubmittingApproval}
                style={{
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmittingApproval ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>📬</span>
                    <span>Send Request to Manager</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
