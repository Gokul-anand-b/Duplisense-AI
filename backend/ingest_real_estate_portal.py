"""
DupliSense AI — Real Estate Portal Ingestion & Test Document Generator
======================================================================
1. Ingests Gokul's completed GitHub project into the database:
   https://github.com/Gokul-anand-b/real-estate-portal
   Status: 'completed'
2. Downloads real code (server.js, package.json) and decomposes it into AST/Regex CodeSegments.
3. Indexes the project and code into FAISS vector databases (faiss_vector_index.bin, faiss_code_index.bin).
4. Generates a matching proposal draft document (Real_Estate_Property_Management_Portal.docx & .txt)
   in demo_documents/ so you can test live duplicate detection.
"""

import os
import sys
import json
import base64
import urllib.request

# Ensure UTF-8 output encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Setup Django environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'duplisense_backend.settings')

import django
django.setup()

from apps.projects.models import Project, ProjectSourceCode, CodeSegment
from apps.accounts.models import User, Department, Team
from apps.projects.code_segmenter import segment_code_file
from apps.similarity.engine import faiss_engine
from apps.similarity.code_verifier import faiss_code_engine

GITHUB_REPO_URL = "https://github.com/Gokul-anand-b/real-estate-portal"
API_BASE = "https://api.github.com/repos/Gokul-anand-b/real-estate-portal/contents"

def fetch_github_file(path):
    """Fetches raw content of a file from the GitHub repository."""
    url = f"{API_BASE}/{path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return base64.b64decode(data['content']).decode('utf-8', errors='replace')
    except Exception as e:
        print(f"[!] Warning: Could not fetch {path} from GitHub API ({e}). Using local template.")
        return None

def ingest_real_estate_project():
    print("=" * 75)
    print("🚀 INGESTING REAL COMPLETED GITHUB PROJECT INTO DUPLISENSE AI DATABASE")
    print("=" * 75)
    print(f"🔗 Repository: {GITHUB_REPO_URL}\n")

    # 1. Ensure admin user and engineering team exist
    admin_user = User.objects.filter(role='admin').first() or User.objects.first()
    dept, _ = Department.objects.get_or_create(code='ENG', defaults={'name': 'Engineering & Products'})
    team, _ = Team.objects.get_or_create(name='Web & Cloud Platforms', defaults={'department': dept})

    # 2. Create or update Project record
    project, created = Project.objects.update_or_create(
        github_url=GITHUB_REPO_URL,
        defaults={
            'title': 'Real Estate Property Management & Rental Portal',
            'description': (
                'Full-stack real estate marketplace and rental management portal with property listings, '
                'image uploads via Multer, user authentication using JWT and bcrypt, real-time messaging '
                'using Socket.IO, and MySQL relational schema.'
            ),
            'problem_statement': (
                'Managing real estate property discovery, inquiries, lease agreements, and buyer-seller '
                'communications requires a centralized web platform with secure authentication, multi-criteria '
                'filtering, and document attachment capabilities.'
            ),
            'objectives': (
                'Develop a high-performance web portal for property listings, integrate secure JWT token '
                'authentication, enable multi-image property uploads with Multer, implement MySQL database schema '
                'for property inventory, and provide real-time messaging.'
            ),
            'programming_languages': ['JavaScript', 'SQL', 'HTML', 'CSS'],
            'frameworks': ['Node.js', 'Express', 'Socket.IO', 'EJS'],
            'database_tech': ['MySQL'],
            'apis_used': ['REST API', 'Multer Upload API', 'JWT Authentication API'],
            'ai_ml_tech': [],
            'status': 'completed',  # Explicitly marked as Completed Production Ready
            'author': admin_user,
            'team': team,
            'department': dept,
        }
    )

    action_str = "Created" if created else "Updated"
    print(f"[+] {action_str} Project record in Database: ID #{project.id} - '{project.title}'")
    print(f"    Status: {project.status.upper()} (Production Ready Baseline)")

    # 3. Fetch server.js from GitHub
    print("\n[+] Downloading real source code from GitHub...")
    server_code = fetch_github_file("server.js")
    if not server_code:
        # Fallback in case GitHub API rate limits
        server_code = '''require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "real_estate_db"
});

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send({ message: "Access denied" });
  jwt.verify(token.split(" ")[1], "secret", (err, user) => {
    if (err) return res.status(403).send({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post("/register", (req, res) => {
  const { name, email, phone, password, address } = req.body;
  db.query("INSERT INTO users (name, email, phone, password, address) VALUES (?, ?, ?, ?, ?)", [name, email, phone, password, address], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ message: "User registered successfully" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0) return res.status(400).send({ message: "User not found" });
    const token = jwt.sign({ id: results[0].id }, "secret", { expiresIn: "1h" });
    res.send({ token, user: results[0] });
  });
});

app.get("/properties", (req, res) => {
  db.query("SELECT * FROM properties", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.post("/upload-property", authenticateToken, upload.single("image"), (req, res) => {
  const { title, price, location, description } = req.body;
  const image = req.file ? req.file.filename : null;
  db.query("INSERT INTO properties (title, price, location, description, image, owner_id) VALUES (?, ?, ?, ?, ?, ?)",
    [title, price, location, description, image, req.user.id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Property listed successfully" });
    });
});

app.listen(5000, () => console.log("Real Estate Server running on port 5000"));
'''

    # Save ProjectSourceCode
    src_file, _ = ProjectSourceCode.objects.update_or_create(
        project=project,
        file_path="server.js",
        defaults={
            'language': 'javascript',
            'content': server_code,
            'line_count': len(server_code.splitlines()),
            'file_size': len(server_code.encode('utf-8')),
        }
    )
    print(f"[+] Saved ProjectSourceCode: {src_file.file_path} ({src_file.line_count} lines)")

    # 4. Decompose server.js into CodeSegments
    CodeSegment.objects.filter(project=project).delete()  # refresh segments
    segments = segment_code_file(server_code, "server.js")
    
    created_segments = []
    for s in segments:
        created_segments.append(CodeSegment(
            project=project,
            source_file=src_file,
            file_path=s['file_path'],
            name=s['name'],
            segment_type=s['segment_type'],
            signature=s.get('signature', ''),
            docstring=s.get('docstring', ''),
            code_content=s['code_content'],
            start_line=s['start_line'],
            end_line=s['end_line'],
        ))

    CodeSegment.objects.bulk_create(created_segments)
    print(f"[+] Extracted and indexed {len(created_segments)} CodeSegments (Functions & API Endpoints):")
    for s in created_segments[:6]:
        print(f"    • [{s.segment_type.upper()}] {s.name} (Lines {s.start_line}-{s.end_line})")

    # 5. Re-index both FAISS vector databases
    print("\n[+] Updating FAISS Vector Indexes...")
    all_projects = list(Project.objects.all())
    faiss_engine.fit_and_index(all_projects)
    print(f"    • Proposal Vector Index: {faiss_engine.index.ntotal} projects indexed in faiss_vector_index.bin")

    total_code_vectors = faiss_code_engine.fit_and_index_all_segments()
    print(f"    • Code Vector Index: {total_code_vectors} code segments indexed in faiss_code_index.bin")

    return project

def generate_test_proposal_document():
    """Generates sample test documents for the real estate portal."""
    demo_dir = os.path.join(os.path.dirname(backend_dir), "demo_documents")
    os.makedirs(demo_dir, exist_ok=True)

    txt_path = os.path.join(demo_dir, "Real_Estate_Property_Management_Portal.txt")
    docx_path = os.path.join(demo_dir, "Real_Estate_Property_Management_Portal.docx")

    txt_content = """# PROJECT PROPOSAL: Real Estate Property Management and Housing Portal

1. Project Title:
Modern Real Estate Property Management and Rental Portal

2. Executive Summary & Description:
This project proposes a responsive web portal for property listings, real estate rentals, and house discovery.
The platform facilitates user registrations, property image uploads, and interactive search filters.
It provides role-based authentication using JWT tokens and connects with a relational MySQL database.

3. Problem Statement:
Home seekers, real estate brokers, and tenants often struggle with fragmented property listing platforms.
There is a need for a secure, unified web portal where owners can post listings with photo attachments,
and tenants can browse verified properties with real-time inquiries.

4. Objectives:
- Develop a full-stack web application using Node.js and Express.
- Implement secure user registration and login with bcrypt and JSON Web Tokens (JWT).
- Support multi-file property image uploads using Multer middleware.
- Design and implement a normalized MySQL database schema for property listings, users, and transactions.
- Provide clean REST API endpoints for property search, filtering, and inquiry submissions.

5. Technology Stack:
- Programming Languages: JavaScript, SQL, HTML5, CSS3
- Frameworks & Libraries: Node.js, Express, Socket.IO, EJS
- Database Technology: MySQL
- APIs & Protocols: REST API, Multer File Upload, JWT Authentication API
- Development Tools: Visual Studio Code, Git, Postman

6. Key Functional Modules:
- User Authentication Module (Register, Login, Password Hashing)
- Property Management Module (Add Property, Image Upload, Price, Location)
- Search & Filter Engine (Browse by Location, Price Range, Property Type)
- Real-time Messaging / Notification Engine
"""

    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(txt_content)
    print(f"\n[+] Generated test text document: {txt_path}")

    # Generate DOCX using python-docx
    try:
        from docx import Document
        from docx.shared import Pt, Inches, RGBColor

        doc = Document()
        
        # Title
        title_para = doc.add_heading("Project Proposal: Real Estate Property Management Portal", level=0)
        
        doc.add_heading("1. Project Title", level=1)
        doc.add_paragraph("Modern Real Estate Property Management and Rental Portal")

        doc.add_heading("2. Executive Summary & Description", level=1)
        doc.add_paragraph(
            "This project proposes a responsive web portal for property listings, real estate rentals, "
            "and house discovery. The platform facilitates user registrations, property image uploads, "
            "and interactive search filters. It provides role-based authentication using JWT tokens "
            "and connects with a relational MySQL database."
        )

        doc.add_heading("3. Problem Statement", level=1)
        doc.add_paragraph(
            "Home seekers, real estate brokers, and tenants often struggle with fragmented property listing platforms. "
            "There is a need for a secure, unified web portal where owners can post listings with photo attachments, "
            "and tenants can browse verified properties with real-time inquiries."
        )

        doc.add_heading("4. Objectives", level=1)
        doc.add_paragraph(
            "• Develop a full-stack web application using Node.js and Express.\n"
            "• Implement secure user registration and login with bcrypt and JSON Web Tokens (JWT).\n"
            "• Support multi-file property image uploads using Multer middleware.\n"
            "• Design and implement a normalized MySQL database schema for property listings, users, and transactions.\n"
            "• Provide clean REST API endpoints for property search, filtering, and inquiry submissions."
        )

        doc.add_heading("5. Technology Stack", level=1)
        doc.add_paragraph(
            "• Programming Languages: JavaScript, SQL, HTML5, CSS3\n"
            "• Frameworks & Libraries: Node.js, Express, Socket.IO, EJS\n"
            "• Database: MySQL\n"
            "• APIs: REST API, Multer File Upload, JWT Authentication API"
        )

        doc.save(docx_path)
        print(f"[+] Generated test Word document: {docx_path}")
    except Exception as e:
        print(f"[!] Warning: Could not generate DOCX ({e}). TXT format is ready.")

if __name__ == '__main__':
    project = ingest_real_estate_project()
    generate_test_proposal_document()
    print("\n" + "=" * 75)
    print("✅ COMPLETED! Your real GitHub project is now stored in SQLite and FAISS.")
    print("   Test documents are ready in demo_documents/ for submission testing.")
    print("=" * 75 + "\n")
