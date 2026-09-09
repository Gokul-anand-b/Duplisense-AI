"""
Generate comprehensive, large-content report for Real Estate Property Management & Valuation Portal.
Creates both .txt and styled .docx documents in demo_documents/ and public/demo_documents/.
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def set_cell_shading(cell, color_hex):
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for margin_name, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{margin_name}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    txt_content = """# TECHNICAL PROJECT REPORT & SYSTEM PROPOSAL

Project Title: AI-Powered Real Estate Property Management, Geospatial Discovery, and Automated Valuation Portal

Abstract & Executive Summary:
This technical report proposes the architectural design, algorithmic implementation, and cloud deployment of an intelligent, enterprise-grade Real Estate Property Management and Housing Discovery Platform. Modern real estate transactions suffer from severe information asymmetry, fragmented MLS syndications, manual lease negotiation bottlenecks, and pervasive fraudulent or duplicate property listings. 

The proposed platform introduces a multi-tier cloud-native architecture combining:
(1) High-throughput geospatial property search utilizing PostgreSQL with the PostGIS spatial indexing extension,
(2) An Automated Valuation Model (AVM) leveraging Gradient Boosted Decision Trees (XGBoost and Scikit-Learn) with hedonic pricing algorithms to predict fair market value and rental yield estimates with sub-4% mean absolute percentage error,
(3) Computer Vision and vector similarity matching using ResNet-50 visual feature extractors and FAISS (Facebook AI Similarity Search) indexers to detect duplicate property listings and fraudulent cross-platform photo reposts,
(4) Automated lease lifecycle management featuring digital signature integration, role-based access control (RBAC), and multi-tenant escrow transaction accounting, and
(5) High-performance reactive web client built with React 19, TypeScript, and Tailwind CSS, backed by a resilient RESTful and WebSocket microservices layer running on FastAPI and Django REST Framework.

Benchmarking on an enterprise dataset of over 250,000 residential and commercial listings demonstrates that the proposed architecture achieves sub-85ms geospatial query latency, reduces duplicate listing pollution by 93.4%, and accelerates property onboarding workflows from days to minutes.

Problem Statement & Market Inefficiencies:
The residential and commercial real estate sector represents one of the largest asset classes globally, yet property management, tenant discovery, and leasing operations continue to rely on fragmented, legacy software architectures plagued by systemic shortcomings:
- Information Asymmetry and Disparate Data Silos: Prospective tenants and buyers must navigate dozens of disparate listing portals, many of which suffer from stale pricing, ghost listings, and unverified broker credentials.
- Duplicate and Fraudulent Listings: Unscrupulous intermediaries frequently scrape photos from legitimate property owners, modify addresses slightly, and repost duplicate listings at artificially discounted rates to harvest user contact details or perpetrate advance-fee wire fraud.
- Primitive Search and Geospatial Inadequacy: Traditional portals rely on rudimentary text search or basic zip code radius filters that fail to capture polygonal commute zones (isochrone analysis), neighborhood walkability, transit corridors, and municipal school catchment boundaries.
- Inaccurate and Subjective Property Valuation: Property valuations historically depend on manual broker comparative market analyses (CMA), which are time-consuming, prone to human cognitive bias, and unable to process high-dimensional spatial-temporal economic indicators.
- Fragmented Lease and Payment Administration: Landlords and tenants must stitch together separate point solutions for background verification, digital lease document execution, recurring rental payment collection, security deposit escrow, and maintenance ticketing.

Objectives & Key Deliverables:
The core engineering objectives of the AI-Powered Real Estate Property Management Portal are:
- Objective 1: Implement an ultra-fast Spatial Search Engine supporting polygonal boundary querying, radial radius lookups, and travel-time isochrone calculations using PostgreSQL and PostGIS with R-Tree spatial indexing.
- Objective 2: Build and deploy an Automated Valuation Model (AVM) using XGBoost, LightGBM, and Scikit-Learn trained on historical transaction records, local interest rates, seasonal indices, and physical housing attributes.
- Objective 3: Develop a Deep-Learning Vector Deduplication Pipeline utilizing Convolutional Neural Networks (CNNs) and FAISS dense vector indices to identify identical or near-duplicate property photos across millions of uploaded assets.
- Objective 4: Establish a Zero-Trust Role-Based Access Control (RBAC) authentication and tenant isolation subsystem supporting distinct personas: Property Owners, Real Estate Agents, Prospective Tenants, Institutional Buyers, and System Administrators.
- Objective 5: Create a responsive, accessible, high-performance web interface using React 19, Vite, and HTML5 Canvas, providing interactive Mapbox/Google Maps integration, floorplan rendering, and mortgage amortization calculators.
- Objective 6: Deliver production-ready cloud deployment pipelines with automated Docker containerization, Kubernetes orchestration, Redis caching, and CI/CD validation.

System Architecture:
The platform adopts a decoupled, microservice-inspired four-tier enterprise architecture:

A. Presentation & Client Application Tier (Frontend)
- Built with React 19, TypeScript, and Vite for modern component bundling and hot-module replacement.
- Reactive state management using Zustand and TanStack Query (React Query) for server-state synchronization and optimistic UI updates.
- Interactive spatial mapping powered by Mapbox GL JS and Google Maps API, supporting clustered map pins, custom polygon drawing for custom neighborhood search, and Street View previews.
- Dynamic data visualization using Recharts for historical price trend line charts, neighborhood demographic heatmaps, and mortgage amortization breakdowns.

B. API Gateway & Microservices Layer (Backend)
- Primary application API server implemented in Python using FastAPI and Django REST Framework (DRF).
- Asynchronous task processing offloaded to Celery workers backed by Redis for heavy operations: image resizing, EXIF metadata extraction, vector embedding generation, automated PDF lease generation, and email/SMS alerts.
- Real-time communication via WebSockets and Socket.IO for live tenant-broker negotiation chat, instant price change alerts, and maintenance request updates.

C. Intelligent AI & Machine Learning Pipeline
- Hedonic Price Estimation Engine: Multi-model ensemble (XGBoost, Random Forest, CatBoost) predicting property valuations based on 48 structural, demographic, and spatial features.
- Vector Similarity Matching & Deduplication: Deep feature extractors compute dense image embeddings stored in a FAISS index to detect duplicate photos and flag syndicated spam listings.
- Natural Language Processing (NLP) Clause Extractor: Automated parsing of uploaded lease agreements (PDF/DOCX) using python-docx and pdfplumber to index security deposit terms, pet policies, and escalation clauses.

D. Distributed Data & Storage Layer
- Primary Relational Database: PostgreSQL 16 equipped with PostGIS extension for spatial geography and geometry primitives (ST_DWithin, ST_Contains, ST_MakePolygon).
- Vector Database / Index: FAISS CPU/GPU for dense embedding similarity queries and image nearest-neighbor clustering.
- In-Memory Cache & Message Broker: Redis Cluster for session state storage, rate-limiting tokens, and Celery task broker queues.
- Blob Storage: Amazon S3 (AWS S3) and MinIO for encrypted, public/private access-controlled storage of high-resolution property photography, 3D virtual tour assets, and signed legal lease PDFs.

Technology Stack:
- Programming Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3, Shell
- Frontend Frameworks: React, React 19, Vite, Next.js, Tailwind CSS
- Backend Frameworks: FastAPI, Django, Django REST Framework, Celery, Node.js, Express.js
- Database & Spatial Technology: PostgreSQL, PostGIS, SQLite, Redis, Redis Cluster, Amazon S3
- AI & Machine Learning Stack: Scikit-Learn, XGBoost, LightGBM, FAISS, PyTorch, Sentence-Transformers, NumPy, Pandas, OpenCV, Pillow
- Document & Data Extraction: pdfplumber, python-docx
- APIs, Protocols & Cloud Infrastructure: REST API, GraphQL, WebSockets, Socket.IO, Google Maps API, Mapbox, Stripe API, Twilio API, SendGrid, Docker, Kubernetes, Nginx, JWT, OAuth2
- Source Control & Repository: GitHub, Git

7. Functional Modules & Implementation Details:
- Module 1: Authentication & Identity Management
  Supports email/password authentication with argon2/bcrypt password hashing, multi-factor authentication (MFA) via TOTP, OAuth2 social login (Google, GitHub, Apple), and fine-grained role-based access control (RBAC) enforcing data segregation across tenant, landlord, and administrator records.
- Module 2: Property Ingestion & Multi-Format Document Processing
  Landlords can upload property profiles manually or ingest bulk property portfolios via CSV, Excel, PDF specification sheets, and DOCX property charters. The system extracts address coordinates, room dimensions, tax parcel numbers, utility arrangements, and legal disclosures automatically.
- Module 3: Geospatial Exploration & Interactive Filter Engine
  Users execute complex spatial searches: "Find 2-bedroom apartments within 15 minutes transit time from Financial District, priced under $3,200/month, with in-unit laundry and dedicated parking." Queries compile into optimized PostGIS spatial queries utilizing GiST indices on geography columns.
- Module 4: Automated Valuation Model (AVM) & Investment Analytics
  Computes estimated property equity, forecasted 5-year capital appreciation, gross rental yield, capitalization rate (Cap Rate), and cash-on-cash return. Users can simulate interest rate fluctuations and down payment scenarios with the embedded financial calculator.
- Module 5: Anti-Fraud & Visual Duplicate Detection Engine
  When photos are uploaded, an automated background Celery task computes perceptual hashes (pHash) and deep 512-dimensional CNN vector embeddings. It queries the active FAISS index to find any existing listing across the platform with greater than 85% visual similarity, alerting moderation teams of potential syndicate scamming.
- Module 6: Digital Lease Execution & Escrow Payment Workflow
  Enables tenants to submit digital rental applications, credit check consents, and bank statement verification. Once approved, the platform populates standardized state lease agreements, routes them for digital signature via embedded canvas signers, and handles tokenized security deposit transactions via Stripe API.

8. Performance Benchmarking & Experimental Results:
- Spatial Query Execution Time: PostGIS indexed spatial bounding box queries averaged 42ms for 100,000 active listings, compared to 1,480ms on non-indexed relational databases.
- Vector Similarity Latency: FAISS index searches across 500,000 image embeddings completed in 8.4 milliseconds with 99.1% recall.
- Valuation Model Precision: The XGBoost ensemble achieved an R² score of 0.942 and a Mean Absolute Percentage Error (MAPE) of 3.82% on out-of-sample metropolitan housing transactions.
- Concurrent Load Resilience: The FastAPI/DRF backend sustained 4,200 requests per second under Locust load testing with 0% dropped transactions and 99th-percentile response times under 120ms.

9. Governance, Security & Regulatory Compliance:
- Compliance with Fair Housing Regulations: Automated auditing algorithms ensure listing descriptions and AI ranking engines do not introduce bias or discriminatory language against protected classes.
- Data Protection & Privacy: Full adherence to GDPR and CCPA requirements, including tenant right-to-be-forgotten data purging, end-to-end encrypted document storage at rest (AES-256), and TLS 1.3 encryption in transit.
- Audit Logging: Immutable event logging tracks all property status alterations, price reductions, bid submissions, and lease approvals for forensic accountability.

10. References:
[1] F. Bourassa, S. Cantoni, and M. Hoesli, "Automated Valuation Models and Spatial Econometrics in Real Estate Markets," Journal of Real Estate Research, vol. 32, no. 1, pp. 121-144, 2020.
[2] J. Johnson, M. Douze, and H. Jégou, "Billion-scale similarity search with GPUs using FAISS," IEEE Transactions on Big Data, vol. 7, no. 3, pp. 535-547, 2021.
[3] T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in Proc. 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 2016, pp. 785-794.
[4] E. Malathy et al., "AI-Driven Cooperative Perception and Digital Twin Platform for Connected Autonomous Vehicles," IEEE Trans. Intell. Transp. Syst., 2026.
[5] PostGIS Project Steering Committee, "PostGIS: Spatial and Geographic Objects for PostgreSQL," PostGIS Documentation v3.4, 2023.
"""

    # 1. Write TXT files
    txt_paths = [
        "demo_documents/Real_Estate_Property_Management_Portal.txt",
        "public/demo_documents/Real_Estate_Property_Management_Portal.txt"
    ]
    for p in txt_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(txt_content.strip())
        print(f"Written TXT to {p}")

    # 2. Generate DOCX files
    doc = Document()

    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("AI-Powered Real Estate Property Management, Geospatial Discovery, and Automated Valuation Portal")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 23, 42) # Slate-900

    # Subtitle / Authors
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Enterprise Software Engineering Specification & Architecture Report\nDepartment of Computer Science & Engineering | Research & Development Division")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(10)
    sub_run.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Metadata Table
    table = doc.add_table(rows=6, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    metadata = [
        ("Project Identifier", "PROP-AI-2026-VAL-09"),
        ("System Architecture", "Decoupled Cloud-Native Microservices (FastAPI + Django + React 19)"),
        ("Spatial Database", "PostgreSQL 16 with PostGIS 3.4 Spatial Extensions"),
        ("AI/ML Core", "XGBoost AVM Ensemble + FAISS Visual Deduplication Index"),
        ("Security Standard", "Zero-Trust RBAC + JWT + AES-256 Cloud Storage"),
        ("Target Scalability", "100,000+ Concurrent Queries | <85ms Latency SLA")
    ]
    for i, (k, v) in enumerate(metadata):
        c1, c2 = table.rows[i].cells
        c1.text = k
        c2.text = v
        set_cell_shading(c1, "F1F5F9")
        set_cell_shading(c2, "FFFFFF")
        c1.paragraphs[0].runs[0].font.bold = True
        c1.paragraphs[0].runs[0].font.size = Pt(9.5)
        c2.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_margins(c1, 80, 80, 120, 120)
        set_cell_margins(c2, 80, 80, 120, 120)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Helper for adding sections
    def add_section(heading_text, body_text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        r = h.add_run(heading_text)
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138) # Dark Blue

        for para in body_text.strip().split("\n\n"):
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(para.strip())
            run.font.name = "Arial"
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(51, 65, 85)

    add_section("Project Title:", "AI-Powered Real Estate Property Management, Geospatial Discovery, and Automated Valuation Portal")

    add_section("Executive Summary:", """This technical report proposes the architectural design, algorithmic implementation, and cloud deployment of an intelligent, enterprise-grade Real Estate Property Management and Housing Discovery Platform. Modern real estate transactions suffer from severe information asymmetry, fragmented MLS syndications, manual lease negotiation bottlenecks, and pervasive fraudulent or duplicate property listings.

The proposed platform introduces a multi-tier cloud-native architecture combining:
(1) High-throughput geospatial property search utilizing PostgreSQL with the PostGIS spatial indexing extension,
(2) An Automated Valuation Model (AVM) leveraging Gradient Boosted Decision Trees (XGBoost and Scikit-Learn) with hedonic pricing algorithms to predict fair market value and rental yield estimates with sub-4% mean absolute percentage error,
(3) Computer Vision and vector similarity matching using ResNet-50 visual feature extractors and FAISS (Facebook AI Similarity Search) indexers to detect duplicate property listings and fraudulent cross-platform photo reposts,
(4) Automated lease lifecycle management featuring digital signature integration, role-based access control (RBAC), and multi-tenant escrow transaction accounting, and
(5) High-performance reactive web client built with React 19, TypeScript, and Tailwind CSS, backed by a resilient RESTful and WebSocket microservices layer running on FastAPI and Django REST Framework.

Benchmarking on an enterprise dataset of over 250,000 residential and commercial listings demonstrates that the proposed architecture achieves sub-85ms geospatial query latency, reduces duplicate listing pollution by 93.4%, and accelerates property onboarding workflows from days to minutes.""")

    add_section("Problem Statement:", """The residential and commercial real estate sector represents one of the largest asset classes globally, yet property management, tenant discovery, and leasing operations continue to rely on fragmented, legacy software architectures plagued by systemic shortcomings:

• Information Asymmetry and Disparate Data Silos: Prospective tenants and buyers must navigate dozens of disparate listing portals, many of which suffer from stale pricing, ghost listings, and unverified broker credentials.
• Duplicate and Fraudulent Listings: Unscrupulous intermediaries frequently scrape photos from legitimate property owners, modify addresses slightly, and repost duplicate listings at artificially discounted rates to harvest user contact details or perpetrate advance-fee wire fraud.
• Primitive Search and Geospatial Inadequacy: Traditional portals rely on rudimentary text search or basic zip code radius filters that fail to capture polygonal commute zones (isochrone analysis), neighborhood walkability, transit corridors, and municipal school catchment boundaries.
• Inaccurate and Subjective Property Valuation: Property valuations historically depend on manual broker comparative market analyses (CMA), which are time-consuming, prone to human cognitive bias, and unable to process high-dimensional spatial-temporal economic indicators.
• Fragmented Lease and Payment Administration: Landlords and tenants must stitch together separate point solutions for background verification, digital lease document execution, recurring rental payment collection, security deposit escrow, and maintenance ticketing.""")

    add_section("Key Objectives:", """The core engineering objectives of the AI-Powered Real Estate Property Management Portal are:

1. Implement an ultra-fast Spatial Search Engine supporting polygonal boundary querying, radial radius lookups, and travel-time isochrone calculations using PostgreSQL and PostGIS with R-Tree spatial indexing.
2. Build and deploy an Automated Valuation Model (AVM) using XGBoost, LightGBM, and Scikit-Learn trained on historical transaction records, local interest rates, seasonal indices, and physical housing attributes.
3. Develop a Deep-Learning Vector Deduplication Pipeline utilizing Convolutional Neural Networks (CNNs) and FAISS dense vector indices to identify identical or near-duplicate property photos across millions of uploaded assets.
4. Establish a Zero-Trust Role-Based Access Control (RBAC) authentication and tenant isolation subsystem supporting distinct personas: Property Owners, Real Estate Agents, Prospective Tenants, Institutional Buyers, and System Administrators.
5. Create a responsive, accessible, high-performance web interface using React 19, Vite, and HTML5 Canvas, providing interactive Mapbox/Google Maps integration, floorplan rendering, and mortgage amortization calculators.
6. Deliver production-ready cloud deployment pipelines with automated Docker containerization, Kubernetes orchestration, Redis caching, and CI/CD validation.""")

    add_section("System Architecture:", """The platform adopts a decoupled, microservice-inspired four-tier enterprise architecture:

A. Presentation & Client Application Tier (Frontend)
Built with React 19, TypeScript, and Vite for modern component bundling and hot-module replacement. Reactive state management using Zustand and TanStack Query for server-state synchronization and optimistic UI updates. Interactive spatial mapping powered by Mapbox GL JS and Google Maps API, supporting clustered map pins, custom polygon drawing for neighborhood boundaries, and Street View previews. Dynamic charts using Recharts for historical price trend line charts and mortgage amortization schedules.

B. API Gateway & Microservices Layer (Backend)
Primary application API server implemented in Python using FastAPI and Django REST Framework (DRF). Asynchronous task processing offloaded to Celery workers backed by Redis for heavy operations: image resizing, EXIF metadata extraction, vector embedding generation, automated PDF lease generation, and email/SMS alerts. Real-time communication via WebSockets and Socket.IO for live tenant-broker negotiation chat and instant price change alerts.

C. Intelligent AI & Machine Learning Pipeline
Hedonic Price Estimation Engine: Multi-model ensemble (XGBoost, Random Forest, CatBoost) predicting property valuations based on 48 structural, demographic, and spatial features. Vector Similarity Matching & Deduplication: Deep feature extractors compute dense image embeddings stored in a FAISS index to detect duplicate photos and flag syndicated spam listings. Natural Language Processing (NLP) Clause Extractor: Automated parsing of uploaded lease agreements (PDF/DOCX) using python-docx and pdfplumber to index security deposit terms, pet policies, and escalation clauses.

D. Distributed Data & Storage Layer
Primary Relational Database: PostgreSQL 16 equipped with PostGIS extension for spatial geography and geometry primitives (ST_DWithin, ST_Contains, ST_MakePolygon). Vector Database / Index: FAISS CPU/GPU for dense embedding similarity queries and image nearest-neighbor clustering. In-Memory Cache & Message Broker: Redis Cluster for session state storage, rate-limiting tokens, and Celery task broker queues. Blob Storage: Amazon S3 (AWS S3) and MinIO for encrypted, public/private access-controlled storage of high-resolution property photography, 3D virtual tour assets, and signed legal lease PDFs.""")

    add_section("Technology Stack:", """• Programming Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3, Shell
• Frontend Frameworks: React, React 19, Vite, Next.js, Tailwind CSS
• Backend Frameworks: FastAPI, Django, Django REST Framework, Celery, Node.js, Express.js
• Database & Spatial Technology: PostgreSQL, PostGIS, SQLite, Redis, Redis Cluster, Amazon S3
• AI & Machine Learning Stack: Scikit-Learn, XGBoost, LightGBM, FAISS, PyTorch, Sentence-Transformers, NumPy, Pandas, OpenCV, Pillow
• Document & Data Extraction: pdfplumber, python-docx
• APIs, Protocols & Cloud Infrastructure: REST API, GraphQL, WebSockets, Socket.IO, Google Maps API, Mapbox, Stripe API, Twilio API, SendGrid, Docker, Kubernetes, Nginx, JWT, OAuth2
• Source Control & Repository: GitHub, Git""")

    add_section("Functional Modules:", """Module 1: Authentication & Identity Management
Supports email/password authentication with argon2/bcrypt password hashing, multi-factor authentication (MFA) via TOTP, OAuth2 social login (Google, GitHub, Apple), and fine-grained role-based access control (RBAC) enforcing data segregation across tenant, landlord, and administrator records.

Module 2: Property Ingestion & Multi-Format Document Processing
Landlords can upload property profiles manually or ingest bulk property portfolios via CSV, Excel, PDF specification sheets, and DOCX property charters. The system extracts address coordinates, room dimensions, tax parcel numbers, utility arrangements, and legal disclosures automatically.

Module 3: Geospatial Exploration & Interactive Filter Engine
Users execute complex spatial searches: 'Find 2-bedroom apartments within 15 minutes transit time from Financial District, priced under $3,200/month, with in-unit laundry and dedicated parking.' Queries compile into optimized PostGIS spatial queries utilizing GiST indices on geography columns.

Module 4: Automated Valuation Model (AVM) & Investment Analytics
Computes estimated property equity, forecasted 5-year capital appreciation, gross rental yield, capitalization rate (Cap Rate), and cash-on-cash return. Users can simulate interest rate fluctuations and down payment scenarios with the embedded financial calculator.

Module 5: Anti-Fraud & Visual Duplicate Detection Engine
When photos are uploaded, an automated background Celery task computes perceptual hashes (pHash) and deep 512-dimensional CNN vector embeddings. It queries the active FAISS index to find any existing listing across the platform with greater than 85% visual similarity, alerting moderation teams of potential syndicate scamming.

Module 6: Digital Lease Execution & Escrow Payment Workflow
Enables tenants to submit digital rental applications, credit check consents, and bank statement verification. Once approved, the platform populates standardized state lease agreements, routes them for digital signature via embedded canvas signers, and handles tokenized security deposit transactions via Stripe API.""")

    add_section("Performance Benchmarking:", """• Spatial Query Execution Time: PostGIS indexed spatial bounding box queries averaged 42ms for 100,000 active listings, compared to 1,480ms on non-indexed relational databases.
• Vector Similarity Latency: FAISS index searches across 500,000 image embeddings completed in 8.4 milliseconds with 99.1% recall.
• Valuation Model Precision: The XGBoost ensemble achieved an R² score of 0.942 and a Mean Absolute Percentage Error (MAPE) of 3.82% on out-of-sample metropolitan housing transactions.
• Concurrent Load Resilience: The FastAPI/DRF backend sustained 4,200 requests per second under Locust load testing with 0% dropped transactions and 99th-percentile response times under 120ms.""")

    add_section("Governance, Security & Compliance:", """• Compliance with Fair Housing Regulations: Automated auditing algorithms ensure listing descriptions and AI ranking engines do not introduce bias or discriminatory language against protected classes.
• Data Protection & Privacy: Full adherence to GDPR and CCPA requirements, including tenant right-to-be-forgotten data purging, end-to-end encrypted document storage at rest (AES-256), and TLS 1.3 encryption in transit.
• Audit Logging: Immutable event logging tracks all property status alterations, price reductions, bid submissions, and lease approvals for forensic accountability.""")

    add_section("References:", """[1] F. Bourassa, S. Cantoni, and M. Hoesli, "Automated Valuation Models and Spatial Econometrics in Real Estate Markets," Journal of Real Estate Research, vol. 32, no. 1, pp. 121-144, 2020.
[2] J. Johnson, M. Douze, and H. Jégou, "Billion-scale similarity search with GPUs using FAISS," IEEE Transactions on Big Data, vol. 7, no. 3, pp. 535-547, 2021.
[3] T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in Proc. 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 2016, pp. 785-794.
[4] E. Malathy et al., "AI-Driven Cooperative Perception and Digital Twin Platform for Connected Autonomous Vehicles," IEEE Trans. Intell. Transp. Syst., 2026.
[5] PostGIS Project Steering Committee, "PostGIS: Spatial and Geographic Objects for PostgreSQL," PostGIS Documentation v3.4, 2023.""")

    docx_paths = [
        "demo_documents/Real_Estate_Property_Management_Portal.docx",
        "public/demo_documents/Real_Estate_Property_Management_Portal.docx"
    ]
    for p in docx_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        doc.save(p)
        print(f"Saved DOCX to {p}")

if __name__ == "__main__":
    create_report()
