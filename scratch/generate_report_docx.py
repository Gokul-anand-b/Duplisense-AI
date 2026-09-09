"""
DupliSense AI — Report to DOCX Converter
Generates a formatted Word document from the report content.
"""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

def set_cell_shading(cell, color_hex):
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)

def add_table_borders(table):
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
    borders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        element = OxmlElement(f'w:{edge}')
        element.set(qn('w:val'), 'single')
        element.set(qn('w:sz'), '4')
        element.set(qn('w:space'), '0')
        element.set(qn('w:color'), '000000')
        borders.append(element)
    tblPr.append(borders)

def create_report():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(3.17)
        section.right_margin = Cm(2.54)

    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    style.paragraph_format.line_spacing = 1.5

    for level in range(1, 4):
        heading_style = doc.styles[f'Heading {level}']
        heading_style.font.name = 'Times New Roman'
        heading_style.font.color.rgb = RGBColor(0, 0, 0)
        heading_style.font.bold = True
        if level == 1:
            heading_style.font.size = Pt(16)
        elif level == 2:
            heading_style.font.size = Pt(14)
        else:
            heading_style.font.size = Pt(12)

    # TITLE PAGE
    for _ in range(6):
        doc.add_paragraph('')

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('DUPLISENSE AI')
    run.bold = True
    run.font.size = Pt(26)
    run.font.name = 'Times New Roman'

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run('Intelligent Duplicate Project Detection &\nComponent Reuse Recommendation Platform')
    run.font.size = Pt(16)
    run.font.name = 'Times New Roman'

    doc.add_paragraph('')
    doc.add_paragraph('')

    tagline = doc.add_paragraph()
    tagline.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = tagline.add_run('A Project Report')
    run.font.size = Pt(14)
    run.font.name = 'Times New Roman'

    doc.add_paragraph('')

    submitted = doc.add_paragraph()
    submitted.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = submitted.add_run('Submitted in partial fulfillment of the requirements\nfor the award of the degree of')
    run.font.size = Pt(12)
    run.font.name = 'Times New Roman'

    doc.add_paragraph('')

    degree = doc.add_paragraph()
    degree.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = degree.add_run('BACHELOR OF ENGINEERING')
    run.bold = True
    run.font.size = Pt(14)
    run.font.name = 'Times New Roman'

    doc.add_paragraph('')

    dept = doc.add_paragraph()
    dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = dept.add_run('Department of Computer Science and Engineering')
    run.font.size = Pt(13)
    run.font.name = 'Times New Roman'

    for _ in range(4):
        doc.add_paragraph('')

    year = doc.add_paragraph()
    year.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = year.add_run('2026')
    run.bold = True
    run.font.size = Pt(14)
    run.font.name = 'Times New Roman'

    doc.add_page_break()

    # ABSTRACT
    doc.add_heading('ABSTRACT', level=1)
    doc.add_paragraph(
        'In modern software enterprises, redundant engineering efforts lead to significant resource wastage, '
        'inflated development costs, and delayed time-to-market. Multiple teams frequently develop overlapping '
        'software architectures without knowledge of pre-existing solutions, resulting in duplicated codebases '
        'and fragmented technology stacks. This project presents DupliSense AI, an intelligent platform designed '
        'to detect redundant software project proposals, surface identical or overlapping architecture patterns, '
        'and recommend reusable components across teams.'
    )
    doc.add_paragraph(
        'DupliSense AI employs a 3-layer Rule-Based Information Extraction (RBIE) pipeline to parse multi-format '
        'documents (PDF, DOCX, TXT) and extract structured metadata including titles, problem statements, objectives, '
        'and technology stacks. The system utilizes an Aho-Corasick Automaton for efficient multi-pattern technology '
        'dictionary matching across a curated library of 200+ technologies with aliases. Extracted project specifications '
        'are vectorized into a normalized embedding space using TF-IDF (Term Frequency-Inverse Document Frequency) with '
        'sublinear term frequency scaling and word n-grams (1,3). The vectorized embeddings are indexed using Facebook AI '
        'Similarity Search (FAISS) for sub-millisecond k-Nearest Neighbor (k-NN) similarity retrieval. For code-level '
        'duplicate detection, the platform parses uploaded source code archives into semantic segments using Abstract Syntax '
        'Tree (AST) analysis and structural regex pattern matching, then indexes these segments into a dedicated FAISS Code '
        'Vector Database for cross-modal search.'
    )
    doc.add_paragraph(
        'The platform incorporates Role-Based Access Control (RBAC) with distinct workflows for Developers, Managers, '
        'and Administrators. It provides automated reuse recommendations with ROI analytics, cost savings estimation, '
        'and an approval workflow for component reuse governance. The system is built using React 19 + Vite for the frontend, '
        'Django 5 + Django REST Framework for the backend, and FAISS (faiss-cpu) + Scikit-Learn for the vector search engine.'
    )
    p = doc.add_paragraph()
    run = p.add_run('Keywords: ')
    run.bold = True
    p.add_run('Duplicate Detection, FAISS, TF-IDF, Abstract Syntax Tree, Aho-Corasick, Component Reuse, '
              'Vector Similarity, NLP, Software Engineering')
    doc.add_page_break()

    # LIST OF ABBREVIATIONS
    doc.add_heading('LIST OF ABBREVIATIONS', level=1)
    abbreviations = [
        ('AI', 'Artificial Intelligence'), ('API', 'Application Programming Interface'),
        ('AST', 'Abstract Syntax Tree'), ('BFS', 'Breadth-First Search'),
        ('CORS', 'Cross-Origin Resource Sharing'), ('CRUD', 'Create, Read, Update, Delete'),
        ('CSS', 'Cascading Style Sheets'), ('DFD', 'Data Flow Diagram'),
        ('DRF', 'Django REST Framework'), ('ER', 'Entity Relationship'),
        ('FAISS', 'Facebook AI Similarity Search'), ('HTML', 'Hypertext Markup Language'),
        ('IDF', 'Inverse Document Frequency'), ('JSON', 'JavaScript Object Notation'),
        ('JWT', 'JSON Web Token'), ('k-NN', 'k-Nearest Neighbor'),
        ('ML', 'Machine Learning'), ('NLP', 'Natural Language Processing'),
        ('ORM', 'Object-Relational Mapping'), ('PDF', 'Portable Document Format'),
        ('RBAC', 'Role-Based Access Control'), ('RBIE', 'Rule-Based Information Extraction'),
        ('REST', 'Representational State Transfer'), ('ROI', 'Return on Investment'),
        ('SPA', 'Single Page Application'), ('SQL', 'Structured Query Language'),
        ('TF', 'Term Frequency'), ('TF-IDF', 'Term Frequency-Inverse Document Frequency'),
        ('UI', 'User Interface'), ('UML', 'Unified Modeling Language'),
        ('URL', 'Uniform Resource Locator'), ('ZIP', 'Zone Information Protocol (Archive Format)'),
    ]
    table = doc.add_table(rows=1, cols=2)
    add_table_borders(table)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table.rows[0].cells
    hdr[0].text = 'Abbreviation'
    hdr[1].text = 'Full Form'
    for cell in hdr:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(11)
        set_cell_shading(cell, 'D9E2F3')
    for abbr, full in abbreviations:
        row = table.add_row().cells
        row[0].text = abbr
        row[1].text = full
        for cell in row:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(11)
    for row in table.rows:
        row.cells[0].width = Inches(1.5)
        row.cells[1].width = Inches(4.5)
    doc.add_page_break()

    # CHAPTER 1
    doc.add_heading('CHAPTER 1 - INTRODUCTION', level=1)
    doc.add_heading('1.1 GENERAL', level=2)
    doc.add_paragraph('Software development in enterprise environments is a complex, multi-team endeavor. As organizations scale, the number of parallel software projects increases exponentially. Different teams across departments often develop solutions to similar problems without awareness of existing implementations, leading to redundant engineering efforts. According to industry reports, up to 30-40% of enterprise software development involves re-implementing functionality that already exists elsewhere within the same organization.')
    doc.add_paragraph('The consequences of such redundancy are significant: inflated development costs, inconsistent technology stacks across teams, duplicated maintenance burden, and delayed product delivery. Traditional approaches to address this problem rely on manual code reviews, keyword-based searches in project management tools, or periodic architecture review meetings. However, these methods are inherently limited - they depend on human memory, are not scalable, and cannot capture semantic similarities between projects that use different terminology to describe the same architectural patterns.')
    doc.add_paragraph('Recent advances in Natural Language Processing (NLP) and dense vector similarity search provide powerful tools to address this challenge. Techniques such as TF-IDF vectorization combined with efficient approximate nearest neighbor search (via libraries like FAISS) enable rapid semantic comparison of project specifications. Furthermore, Abstract Syntax Tree (AST) analysis allows structural comparison of source code beyond mere textual matching, identifying functional duplicates even when variable names and formatting differ.')
    doc.add_paragraph('DupliSense AI leverages these technologies to create an automated, intelligent platform that detects duplicate project proposals at both the document level and the code level, surfaces overlapping architecture patterns, and recommends reusable components - ultimately saving engineering hours and reducing costs.')

    doc.add_heading('1.2 OBJECTIVE', level=2)
    doc.add_paragraph('The primary objectives of DupliSense AI are:')
    objectives = [
        'Automate document ingestion and metadata extraction from multi-format project proposals (PDF, DOCX, TXT) using a 3-layer Rule-Based Information Extraction pipeline incorporating section-aware regex parsing and Aho-Corasick technology dictionary matching.',
        'Detect semantic similarity between software project proposals by vectorizing architectural specifications into a normalized TF-IDF embedding space and performing sub-millisecond k-Nearest Neighbor retrieval using the FAISS dense vector index.',
        'Identify code-level duplication by parsing uploaded source code archives into AST-based semantic segments (functions, classes, API endpoints) and executing cross-modal vector search against indexed codebases.',
        'Generate intelligent reuse recommendations with ROI analytics, including estimated engineering hours saved and cost savings calculations, when similarity thresholds are exceeded.',
        'Enforce governance through Role-Based Access Control (RBAC) with distinct workflows for Developers (submit proposals, view duplicate alerts), Managers (approve/reject reuse proposals), and Administrators (system-wide governance and team management).',
        'Provide comprehensive analytics dashboards with real-time visualization of similarity distributions, monthly trends, cost savings by category, and department-wise reuse metrics.',
    ]
    for i, obj in enumerate(objectives, 1):
        doc.add_paragraph(f'{i}. {obj}')

    doc.add_heading('1.3 EXISTING SYSTEM', level=2)
    doc.add_paragraph('Current approaches to detecting duplicate software projects and code reuse in enterprise environments include:')
    table = doc.add_table(rows=1, cols=3)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Tool/Approach', 'Methodology', 'Limitations']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(10)
        set_cell_shading(hdr[i], 'D9E2F3')
    existing = [
        ('Turnitin', 'Lexical text matching for plagiarism detection', 'Designed for academic papers; cannot parse code or technical architectures'),
        ('MOSS', 'Token-based code comparison', 'Limited to code files only; no document parsing; no reuse recommendations'),
        ('JPlag', 'Token-level code similarity', 'Supports limited languages; no semantic understanding of architecture'),
        ('SonarQube', 'Static code analysis for quality metrics', 'Focused on code quality/bugs, not cross-project duplication detection'),
        ('Manual Reviews', 'Human-driven review meetings', 'Not scalable; depends on reviewer knowledge; time-consuming'),
        ('Keyword Search', 'Simple text matching in PM tools', 'Cannot capture semantic similarity; high false positive rate'),
    ]
    for tool, method, limit in existing:
        row = table.add_row().cells
        row[0].text = tool; row[1].text = method; row[2].text = limit
        for cell in row:
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(10)
    doc.add_paragraph('')
    doc.add_paragraph('Key limitations of the existing systems:')
    for lim in ['No multi-format document parsing', 'No semantic similarity detection', 'No cross-modal verification', 'No reuse recommendations', 'No governance workflow']:
        doc.add_paragraph(lim, style='List Bullet')

    doc.add_heading('1.4 PROPOSED SYSTEM', level=2)
    doc.add_paragraph('DupliSense AI addresses all limitations of the existing systems through an integrated platform with the following capabilities:')
    proposed = [
        ('1. Multi-Format Document Ingestion Engine', 'Extracts architecture metadata from PDF, DOCX, and TXT files using a 3-layer extraction pipeline: Layer 1 (Text Extraction via pdfplumber/python-docx), Layer 2 (Section-Aware Regex Parser), Layer 3 (Aho-Corasick Automaton + TF-IDF Paragraph Scorer).'),
        ('2. FAISS Dense Vector Similarity Matching', 'Vectorizes proposals into 512D normalized TF-IDF embeddings. Performs sub-millisecond k-NN search using FAISS IndexFlatIP. Multi-factor hybrid score: 45% Text + 40% Tech Jaccard + 15% Concept Overlap.'),
        ('3. AST & Lexical Code Duplicate Detection', 'Parses ZIP archives into semantic code segments using Python AST and structural regex for 15+ languages. Cross-modal search queries specifications against codebases.'),
        ('4. Intelligent Reuse Recommendations & ROI Analytics', 'Auto-generates reuse recommendations when similarity exceeds 50%. Estimates hours saved and cost savings. Category-wise savings breakdown.'),
        ('5. Role-Based Access Control & Governance', 'Three roles: Developer, Manager, Admin. Approval workflow for code reuse. Immutable activity logs for auditing.'),
    ]
    for heading, content in proposed:
        p = doc.add_paragraph()
        run = p.add_run(heading)
        run.bold = True
        doc.add_paragraph(content)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('[Figure 1.1: Proposed System Architecture - See Mermaid Diagram in Markdown Report]')
    run.italic = True; run.font.color.rgb = RGBColor(100, 100, 100)
    doc.add_page_break()

    # CHAPTER 2
    doc.add_heading('CHAPTER 2 - LITERATURE SURVEY', level=1)
    doc.add_heading('2.1 LITERATURE REVIEW', level=2)
    papers = [
        ('1', 'Johnson et al. (2017)', 'A Survey on Software Code Clone Detection', 'Survey of text, token, tree, and semantic clone detection', 'AST methods achieve higher precision; hybrid methods yield best results'),
        ('2', 'Roy & Cordy (2007)', 'A Survey on Software Clone Detection Research', 'Classification: Type-1 to Type-4 clones', 'Defined standard clone taxonomy; Type-3/4 need semantic analysis'),
        ('3', 'Rattan et al. (2013)', 'Software Clone Detection: A Systematic Review', 'Analysis of 145 clone detection tools', 'No single tool addresses all types; hybrid approaches recommended'),
        ('4', 'Sajnani et al. (2016)', 'SourcererCC: Scaling Code Clone Detection', 'Token-based with inverted index + Jaccard', 'Scalable to 200M+ lines; limited semantic understanding'),
        ('5', 'Johnson et al. (2022)', 'FAISS: Efficient Similarity Search', 'Dense vector indexing + product quantization', 'Sub-millisecond search on billion-scale databases'),
        ('6', 'Robertson & Zaragoza (2009)', 'Probabilistic Relevance Framework: BM25', 'TF-IDF and BM25 ranking models', 'Sublinear TF + IDF provides robust document similarity'),
        ('7', 'Aho & Corasick (1975)', 'Efficient String Matching', 'Trie + failure links automaton', 'O(n+m+z) multi-pattern matching'),
        ('8', 'Salton & Buckley (1988)', 'Term-Weighting in Text Retrieval', 'TF-IDF term weighting schemes', 'TF-IDF + cosine effective for document comparison'),
        ('9', 'Li et al. (2006)', 'SEMI: Semantic Similarity Estimation', 'LSI + structural analysis', 'Combined approach improves accuracy by 20-35%'),
        ('10', 'White et al. (2016)', 'Deep Learning for Code Clone Detection', 'Recursive Autoencoders on AST', 'DL on AST captures semantic equivalence better'),
    ]
    table = doc.add_table(rows=1, cols=5)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['S.No.', 'Author(s)', 'Title', 'Methodology', 'Key Findings']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(9)
        set_cell_shading(hdr[i], 'D9E2F3')
    for paper in papers:
        row = table.add_row().cells
        for i, val in enumerate(paper):
            row[i].text = val
            for p in row[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)

    doc.add_heading('2.2 COMPARISON AND DISCUSSION', level=2)
    table = doc.add_table(rows=1, cols=7)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Feature', 'Turnitin', 'MOSS', 'JPlag', 'SonarQube', 'SourcererCC', 'DupliSense AI']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(8)
        set_cell_shading(hdr[i], 'D9E2F3')
    comparisons = [
        ('Multi-format doc parsing', 'X', 'X', 'X', 'X', 'X', 'YES'),
        ('Tech stack detection', 'X', 'X', 'X', 'Partial', 'X', 'YES (200+)'),
        ('FAISS vector similarity', 'X', 'X', 'X', 'X', 'X', 'YES (512D)'),
        ('AST code analysis', 'X', 'X', 'Token', 'AST', 'Token', 'YES'),
        ('Cross-modal search', 'X', 'X', 'X', 'X', 'X', 'YES'),
        ('Reuse recommendations', 'X', 'X', 'X', 'X', 'X', 'YES + ROI'),
        ('Cost savings analytics', 'X', 'X', 'X', 'X', 'X', 'YES'),
        ('RBAC governance', 'X', 'X', 'X', 'YES', 'X', 'YES (3 roles)'),
        ('Analytics dashboard', 'X', 'X', 'X', 'YES', 'X', 'YES'),
        ('Multi-language support', 'X', '25+', '9', '30+', '6', '15+'),
    ]
    for comp in comparisons:
        row = table.add_row().cells
        for i, val in enumerate(comp):
            row[i].text = val
            for p in row[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(8)

    doc.add_heading('2.3 CONCLUSION', level=2)
    doc.add_paragraph('The literature review reveals a significant gap: no existing system combines document-level semantic similarity detection with code-level AST analysis, automated reuse recommendations, and governance workflows in a single integrated platform. DupliSense AI bridges this gap by integrating NLP-driven document extraction, dense vector search (FAISS), structural code analysis (AST + cross-modal search), actionable intelligence (ROI quantification), and enterprise governance (RBAC with approval workflows).')
    doc.add_page_break()

    # CHAPTER 3
    doc.add_heading('CHAPTER 3 - SYSTEM DESIGN', level=1)
    doc.add_heading('3.1 SYSTEM ARCHITECTURE', level=2)
    doc.add_paragraph('The system follows a client-server architecture with four layers: Frontend (React 19 + Vite SPA), API Layer (Django 5 + DRF), AI/ML Processing (RBIE Pipeline, FAISS, AST Parser), and Data Storage (SQLite + FAISS index files).')
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('[Figure 3.1: System Architecture Diagram - See Mermaid Diagram in Markdown Report]')
    run.italic = True; run.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_heading('3.2 SYSTEM REQUIREMENTS', level=2)
    doc.add_heading('3.2.1 SOFTWARE REQUIREMENTS', level=3)
    table = doc.add_table(rows=1, cols=4)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Category', 'Technology', 'Version', 'Purpose']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(10)
        set_cell_shading(hdr[i], 'D9E2F3')
    sw = [('Frontend', 'React', '19.2.8', 'UI development'), ('Build', 'Vite', '8.2.0', 'HMR dev server'), ('Routing', 'React Router DOM', '7.18.2', 'SPA routing'), ('HTTP', 'Axios', '1.19.0', 'API communication'), ('Charts', 'Recharts', '3.10.1', 'Data visualization'), ('Backend', 'Django', '5.0+', 'Web framework'), ('REST API', 'DRF', '3.15+', 'API serialization'), ('CORS', 'django-cors-headers', '4.4+', 'CORS support'), ('Vector Search', 'FAISS (faiss-cpu)', '1.8+', 'Vector similarity'), ('ML/NLP', 'Scikit-Learn', '1.5+', 'TF-IDF vectorization'), ('Numerical', 'NumPy', '1.26+', 'Vector operations'), ('PDF', 'pdfplumber', '0.11+', 'PDF text extraction'), ('DOCX', 'python-docx', '1.1+', 'Word parsing'), ('Runtime', 'Python', '3.10+', 'Backend'), ('Runtime', 'Node.js', '18+', 'Frontend'), ('Database', 'SQLite', '3.x', 'Development DB')]
    for d in sw:
        row = table.add_row().cells
        for i, val in enumerate(d):
            row[i].text = val
            for p in row[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(10)

    doc.add_heading('3.2.2 HARDWARE REQUIREMENTS', level=3)
    table = doc.add_table(rows=1, cols=3)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Component', 'Minimum', 'Recommended']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(10)
        set_cell_shading(hdr[i], 'D9E2F3')
    for d in [('Processor', 'Intel i5 / AMD Ryzen 5', 'Intel i7 / AMD Ryzen 7'), ('RAM', '8 GB', '16 GB'), ('Storage', '10 GB free', '50 GB SSD'), ('Network', 'Broadband', 'Low-latency'), ('Display', '1366x768', '1920x1080+')]:
        row = table.add_row().cells
        for i, val in enumerate(d):
            row[i].text = val

    doc.add_heading('3.2.3 DATASET REQUIREMENTS', level=3)
    doc.add_paragraph('1. Project Proposals (PDF, DOCX, TXT) - Source documents for extraction and similarity\n2. Source Code Archives (ZIP) - Codebases for AST parsing\n3. Technology Dictionary (200+ entries) - Aho-Corasick pattern matching\n4. Demo Documents - Pre-loaded test files')

    doc.add_heading('3.2.4 DEPLOYMENT AND SCALING', level=3)
    doc.add_paragraph('Development: Vite Dev Server (localhost:5173) + Django runserver (localhost:8000) + SQLite\nProduction: Nginx + Gunicorn + PostgreSQL + Docker + Docker Compose')

    doc.add_heading('3.3 SYSTEM DESIGN', level=2)
    for title, fig in [('3.3.1 ACTIVITY DIAGRAM', '3.2'), ('3.3.2 DATA FLOW DIAGRAM', '3.3/3.4'), ('3.3.3 USE CASE DIAGRAM', '3.5'), ('3.3.4 ER DIAGRAM', '3.6'), ('3.3.5 SEQUENCE DIAGRAM', '3.7')]:
        doc.add_heading(title, level=3)
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(f'[Figure {fig}: {title.split(" ", 1)[1]} - See Mermaid Diagram in Markdown Report]')
        run.italic = True; run.font.color.rgb = RGBColor(100, 100, 100)

    # Activity diagram description
    doc.add_paragraph('The activity diagram shows: User Login -> Role Check -> Developer submits project (manual or document upload) -> 3-Layer RBIE extraction -> FAISS similarity scan -> If score >= 50% generate recommendation -> Manager approves/rejects -> Admin manages governance.')
    # DFD description
    doc.add_paragraph('Level-0 DFD: Three entities (Developer, Manager, Admin) interact with DupliSense AI system and Database.\nLevel-1 DFD: Four processes - 1.0 Document Ingestion, 2.0 Similarity Detection, 3.0 Code Analysis, 4.0 Recommendation Engine.')
    # ER description
    doc.add_paragraph('Database schema: 11 entities - Department, Team, User, Project, ProjectDocument, ProjectSourceCode, CodeSegment, SimilarityResult, Recommendation, CostSavings, Approval, ActivityLog.')
    # Sequence description
    doc.add_paragraph('Sequence: Developer uploads document -> API invokes RBIE pipeline -> Returns extracted fields -> Developer submits -> FAISS scan -> Hybrid score computation -> Store results -> Return to frontend.')
    doc.add_page_break()

    # CHAPTER 4
    doc.add_heading('CHAPTER 4 - PROJECT DESCRIPTION', level=1)
    doc.add_heading('4.1 METHODOLOGIES', level=2)
    doc.add_paragraph('DupliSense AI follows Agile development with iterative prototyping, component-based architecture, RESTful API design, and vector similarity methodology (TF-IDF + FAISS k-NN with multi-factor scoring).')

    doc.add_heading('4.2 MODULES', level=2)
    modules = [
        ('4.2.1 DOCUMENT INGESTION & EXTRACTION MODULE', 'extractor.py (882 lines)', '3-layer RBIE pipeline: Text Extraction (pdfplumber/python-docx), Section-Aware Regex Parser (5 field types), Aho-Corasick Automaton (200+ technology patterns with word boundary validation), TF-IDF Paragraph Scorer for intelligent field inference.'),
        ('4.2.2 SIMILARITY DETECTION MODULE', 'engine.py (246 lines)', 'FAISSVectorEngine (512D IndexFlatIP, L2-normalized vectors = cosine similarity). Hybrid score: 45% TF-IDF cosine + 40% Jaccard tech overlap + 15% concept overlap. Auto-scan on project submission.'),
        ('4.2.3 CODE DUPLICATE DETECTION MODULE', 'code_segmenter.py (348 lines) + code_verifier.py (222 lines)', 'Python AST parsing for functions/classes/endpoints. Structural regex for JS/TS/Go/Java/C++/Rust. Dedicated FAISS Code Engine for cross-modal search. 22 file extensions, 15+ languages.'),
        ('4.2.4 REUSE RECOMMENDATION & ROI MODULE', 'approvals/models.py + views.py', 'Auto-generated recommendations when score >= 50%. CostSavings model: hours_saved x hourly_rate (Rs.1600/hr). Categories: code, api, database, ui, documentation, expertise.'),
        ('4.2.5 USER MANAGEMENT & RBAC MODULE', 'accounts/models.py + views.py', 'User (extends AbstractUser) with email login, roles (developer/manager/admin). Department and Team models. Route-level protection via ProtectedRoute components.'),
        ('4.2.6 APPROVAL WORKFLOW MODULE', 'approvals/views.py', 'Auto-generate -> Developer request -> Manager approve/reject -> Create CostSavings -> Download source code ZIP with REUSE_GUIDE.md.'),
        ('4.2.7 ANALYTICS & AUDIT MODULE', 'analytics/views.py + core/models.py', 'KPI cards, similarity distribution (pie), monthly trends (line), savings by category (bar), department reuse (horizontal bar), most reused technologies. ActivityLog for immutable audit trail.'),
        ('4.2.8 UI MODULE', 'React 19 + Vite 8 frontend', '12 pages: Login, Register, Dashboard, ProjectList, ProjectSubmit, ProjectDetails, SimilarityResults, SimilarityDetail, Recommendations, Analytics, ApprovalList, AdminDashboard, Profile. Glassmorphism design, responsive layout, Recharts visualization.'),
    ]
    for title, files, desc in modules:
        doc.add_heading(title, level=3)
        p = doc.add_paragraph()
        run = p.add_run(f'Files: {files}')
        run.italic = True
        doc.add_paragraph(desc)

    # RBAC table
    doc.add_paragraph('')
    p = doc.add_paragraph()
    run = p.add_run('RBAC Permission Matrix:')
    run.bold = True
    table = doc.add_table(rows=1, cols=4)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Feature', 'Developer', 'Manager', 'Admin']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(10)
        set_cell_shading(hdr[i], 'D9E2F3')
    for d in [('Submit Projects', 'YES', 'YES', 'YES'), ('View Similarity', 'YES', 'YES', 'YES'), ('Request Reuse', 'YES', 'YES', 'YES'), ('Approve/Reject', 'NO', 'YES', 'YES'), ('ROI Analytics', 'NO', 'YES', 'YES'), ('Manage Users', 'NO', 'NO', 'YES'), ('Audit Logs', 'NO', 'NO', 'YES')]:
        row = table.add_row().cells
        for i, val in enumerate(d):
            row[i].text = val
            for p in row[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(10)

    # ROI table
    doc.add_paragraph('')
    p = doc.add_paragraph()
    run = p.add_run('ROI Estimation:')
    run.bold = True
    table = doc.add_table(rows=1, cols=4)
    add_table_borders(table)
    hdr = table.rows[0].cells
    for i, h in enumerate(['Similarity Level', 'Code Overlap', 'Hours Saved', 'Cost Saved']):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True; r.font.size = Pt(10)
        set_cell_shading(hdr[i], 'D9E2F3')
    for d in [('High (>=80%)', '>=70%', '160 hrs', 'Rs.2,56,000'), ('Medium (60-80%)', '>=45%', '80 hrs', 'Rs.1,28,000'), ('Partial (40-60%)', '<45%', '20 hrs', 'Rs.32,000')]:
        row = table.add_row().cells
        for i, val in enumerate(d):
            row[i].text = val
    doc.add_page_break()

    # CHAPTER 5
    doc.add_heading('CHAPTER 5 - IMPLEMENTATION AND RESULT DISCUSSION', level=1)
    doc.add_heading('5.1 IMPLEMENTATION RESULTS', level=2)

    impl_sections = [
        ('5.1.1 IMPLEMENTATION OF DOCUMENT INGESTION & EXTRACTION',
         'The document extraction pipeline is implemented in extractor.py (882 lines). The Aho-Corasick Automaton builds a trie with BFS failure links, scanning text against 200+ technology keyword patterns in O(n+m+z) time with word boundary validation. The Technology Dictionary contains 33 programming languages, 53 frameworks, 40 databases, 42 APIs, and 42 AI/ML technologies with aliases. Sample output includes fields with confidence levels (high/medium/low) and extraction summary.'),
        ('5.1.2 IMPLEMENTATION OF TF-IDF VECTORIZATION',
         'TF-IDF vectorization uses Scikit-Learn TfidfVectorizer with: stop_words="english", ngram_range=(1,3), max_features=512, sublinear_tf=True (logarithmic scaling: 1 + log(tf)). For pairwise comparison, 5000 features are used.'),
        ('5.1.3 IMPLEMENTATION OF FAISS SIMILARITY SEARCH',
         'FAISS IndexFlatIP on L2-normalized vectors computes cosine similarity (for unit vectors, inner product = cos(theta)). The index is built by fitting TF-IDF vectors, padding to 512D, normalizing, and persisting to faiss_vector_index.bin.'),
        ('5.1.4 IMPLEMENTATION OF AST CODE ANALYSIS',
         'Python AST walks the tree for FunctionDef, AsyncFunctionDef, and ClassDef nodes extracting docstrings, signatures, line boundaries, and decorator-based endpoint detection. Multi-language regex supports JS/TS/Go/Java/C++/Rust. 22 file extensions, 15+ languages.'),
        ('5.1.5 IMPLEMENTATION OF REUSE RECOMMENDATIONS',
         'Auto-generated when similarity >= 50%. Creates Recommendation linked to SimilarityResult with status "pending". Approval creates CostSavings (Rs.1,600/hr default). Download source code as ZIP with REUSE_GUIDE.md.'),
        ('5.1.6 IMPLEMENTATION OF RBAC & APPROVAL WORKFLOW',
         'React ProtectedRoute components check authentication and role. AuthContext manages login state. Manager-only (/approvals) and Admin-only (/admin) routes use requiredRole props.'),
    ]
    for title, content in impl_sections:
        doc.add_heading(title, level=3)
        doc.add_paragraph(content)

    doc.add_heading('5.2 DISCUSSION', level=2)
    p = doc.add_paragraph(); run = p.add_run('Strengths:'); run.bold = True
    for s in ['Comprehensive 3-layer RBIE pipeline with Aho-Corasick (200+ patterns in linear time)', 'Multi-factor hybrid scoring (45% text + 40% tech + 15% concept) for robust similarity', 'Novel cross-modal code verification (natural language -> code segments)', 'End-to-end RBAC governance with approval workflows and audit trails']:
        doc.add_paragraph(s, style='List Bullet')
    p = doc.add_paragraph(); run = p.add_run('Limitations:'); run.bold = True
    for s in ['TF-IDF bag-of-words cannot capture deep semantic meaning', 'FAISS index rebuilt from scratch (not incremental)', 'Full AST parsing only for Python (others use regex)', 'SQLite not suitable for production concurrent workloads']:
        doc.add_paragraph(s, style='List Bullet')
    doc.add_page_break()

    # CHAPTER 6
    doc.add_heading('CHAPTER 6 - CONCLUSION AND FUTURE WORK', level=1)
    doc.add_heading('6.1 CONCLUSION', level=2)
    doc.add_paragraph('DupliSense AI successfully addresses the critical problem of redundant software engineering efforts in enterprise environments. The platform provides an end-to-end solution for detecting duplicate project proposals, verifying code-level overlap, and facilitating intelligent component reuse within a governed RBAC framework.')
    doc.add_paragraph('Key accomplishments:')
    for i, acc in enumerate(['3-Layer RBIE Pipeline with Aho-Corasick Automaton (200+ technologies, O(n) matching) and TF-IDF Paragraph Scorer.', 'FAISS Dense Vector Similarity Engine with sub-millisecond k-NN search over 512D TF-IDF embeddings and multi-factor hybrid scoring.', 'Cross-Modal AST Code Verification with Python AST + multi-language regex, dedicated FAISS Code Vector Database.', 'Automated Reuse Recommendations with ROI analytics, cost savings estimation (Rs.1,600/hr), and complete approval workflow.', 'Modern full-stack: React 19 + Vite 8 (glassmorphism UI) and Django 5 + DRF (comprehensive REST API).'], 1):
        doc.add_paragraph(f'{i}. {acc}')

    doc.add_heading('6.2 FUTURE WORK', level=2)
    for i, item in enumerate(['Transformer embeddings: Replace TF-IDF with Sentence-BERT or all-MiniLM-L6-v2 for deeper semantic similarity.', 'Incremental FAISS: Use IndexIVFFlat for O(1) project additions.', 'PostgreSQL migration: Production-grade DB with pgvector for native vector search.', 'Docker containerization: Docker Compose for reproducible deployment.', 'Real-time alerts: WebSocket notifications via Django Channels.', 'GitHub/GitLab integration: Direct repository import via Git APIs.', 'Multi-language AST: Extend to JavaScript (Babel), TypeScript, Java (javalang), Go.', 'LLM summarization: GPT-4/Gemini for detailed architectural comparison reports.', 'CI/CD integration: Auto-scan on commits via GitHub Actions/GitLab CI.', 'Federated search: Cross-organization scanning with data privacy.'], 1):
        doc.add_paragraph(f'{i}. {item}')
    doc.add_page_break()

    # REFERENCES
    doc.add_heading('REFERENCES', level=1)
    refs = [
        'Aho, A. V., & Corasick, M. J. (1975). Efficient string matching: An aid to bibliographic search. Communications of the ACM, 18(6), 333-340.',
        'Johnson, J., Douze, M., & Jegou, H. (2022). Billion-scale similarity search with GPUs. IEEE Transactions on Big Data, 7(3), 535-547.',
        'Roy, C. K., & Cordy, J. R. (2007). A survey on software clone detection research. Queen\'s University TR 2007-541.',
        'Rattan, D., Bhatia, R., & Singh, M. (2013). Software clone detection: A systematic review. IST, 55(7), 1165-1199.',
        'Sajnani, H., et al. (2016). SourcererCC: Scaling code clone detection to big code. ICSE 2016, 1157-1168.',
        'Salton, G., & Buckley, C. (1988). Term-weighting approaches in automatic text retrieval. IPM, 24(5), 513-523.',
        'Robertson, S. E., & Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. FnTIR, 3(4), 333-389.',
        'Li, B., et al. (2006). SEMI: Semantic similarity estimation for software artifacts. ASE 2006, 69-78.',
        'White, M., et al. (2016). Deep learning code fragments for code clone detection. ASE 2016, 87-98.',
        'Django Software Foundation. (2024). Django Documentation. https://docs.djangoproject.com/',
        'Meta AI Research. (2024). FAISS Library. https://github.com/facebookresearch/faiss',
        'Scikit-learn Developers. (2024). TfidfVectorizer. https://scikit-learn.org/',
        'React Team. (2025). React 19 Documentation. https://react.dev/',
    ]
    for i, ref in enumerate(refs, 1):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.27)
        p.paragraph_format.first_line_indent = Cm(-1.27)
        run = p.add_run(f'[{i}] ')
        run.bold = True
        p.add_run(ref)

    # SAVE
    output_path = r'c:\Users\bgoku\OneDrive\Desktop\final year project\DupliSense_AI_Report.docx'
    doc.save(output_path)
    print(f"\nReport saved to: {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")
    return output_path

if __name__ == '__main__':
    create_report()
