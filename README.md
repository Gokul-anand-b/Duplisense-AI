# DupliSense AI 🚀
### Intelligent Duplicate Project Detection & Component Reuse Recommendation Platform

DupliSense AI is an enterprise-grade platform designed to detect redundant software project proposals, surface identical or overlapping architecture patterns, and recommend reusable components across teams. By leveraging dense vector similarity, AST-based source code verification, and automated document parsing, DupliSense AI prevents redundant engineering efforts and maximizes cost efficiency.

---

## 🌟 Key Features

- 📄 **Multi-Format Document Ingestion Engine**
  - Extracts architecture metadata, problem statements, objectives, and technology stacks from **PDF**, **DOCX**, and **TXT** files.
  - Multi-layer extraction pipeline using section-aware regex parsing and Aho-Corasick technology dictionaries.

- 🔍 **FAISS Dense Vector Similarity Matching**
  - Vectorizes architectural proposals and project specs into normalized embedding spaces.
  - Performs sub-millisecond $k$-Nearest Neighbor ($k$-NN) similarity searches using Facebook AI Similarity Search (**FAISS**).

- 💻 **AST & Lexical Code Duplicate Detection**
  - Parses uploaded source code archives (ZIP) into functions and structural segments using Abstract Syntax Trees (AST).
  - Flags verbatim and structural code duplication across historical repositories with confidence scoring.

- 💡 **Intelligent Reuse Recommendations & ROI Analytics**
  - Automatically recommends existing microservices, libraries, or pipelines to reuse when similarity exceeds threshold.
  - Real-time ROI and cost savings calculations based on estimated engineering hours saved.

- 🔐 **Role-Based Access Control (RBAC) & Governance**
  - Distinct workflows for **Developers** (submit proposals, view duplicate alerts), **Managers** (approve/reject reuse proposals), and **Admins** (system-wide governance and team management).
  - Immutable activity logs for tracking proposal lifecycles and audits.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Data Visualization**: Recharts
- **Icons**: React Icons (Lucide / Feather)
- **Styling**: Modern CSS System with Glassmorphism and responsive design

### Backend
- **Framework**: Python 3.10+ / Django 5 + Django REST Framework (DRF)
- **Vector Search Engine**: FAISS (`faiss-cpu`) + Scikit-Learn (TF-IDF Vectorizer)
- **Document Processing**: `pdfplumber`, `python-docx`
- **Database**: SQLite (Development) / PostgreSQL-ready
- **CORS**: `django-cors-headers`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher)

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed the initial demo dataset (users, teams, projects, recommendations):
   ```bash
   python manage.py seed_data
   ```

6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup

1. From the project root, install Node dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

## 👥 Default Demo Credentials

After running `python manage.py seed_data`, you can sign in with the following accounts:

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@duplisense.ai` | `password123` | Full system access, audit logs, team settings |
| **Manager** | `manager` / `manager@duplisense.ai` | `password123` | Approve/reject reuse recommendations, view ROI analytics |
| **Developer** | `developer` / `dev@duplisense.ai` | `password123` | Submit projects, view similarity scan results |

---

## 📁 Project Structure

```text
├── backend/
│   ├── apps/
│   │   ├── accounts/       # User management, RBAC, teams & departments
│   │   ├── analytics/      # Cost savings & similarity metrics
│   │   ├── approvals/      # Component reuse recommendations & approval flow
│   │   ├── core/           # Audit logs & seed data management command
│   │   ├── projects/       # Project ingestion, extraction, and code segmenting
│   │   └── similarity/     # FAISS vector engine, code verifier, similarity scoring
│   ├── duplisense_backend/ # Django core config, URLs & settings
│   ├── manage.py
│   └── requirements.txt
├── demo_documents/         # Sample PDF, DOCX, and TXT files for test ingestion
├── src/
│   ├── components/         # Reusable UI components (Navbar, Sidebar, Modals, Cards)
│   ├── context/            # AuthContext & global state providers
│   ├── pages/              # Project Dashboard, Ingestion, Similarity, Approvals, Analytics
│   ├── services/           # Axios API service layers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render

1. Create a free account at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/Gokul-anand-b/Duplisense-AI`.
4. Configure the Web Service:
   - **Name**: `duplisense-backend` (or any unique name)
   - **Region**: Choose closest to you (e.g., Singapore or Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate && python manage.py seed_data`)
   - **Start Command**: `gunicorn duplisense_backend.wsgi:application`
5. In **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9`
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<Generate a random secure string>`
   - `ALLOWED_HOSTS`: `*`
6. *(Optional)* To use PostgreSQL instead of SQLite:
   - Create a **PostgreSQL** database on Render (free tier).
   - Add `DATABASE_URL` as an environment variable pointing to your Render Postgres internal database URL.
7. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://duplisense-backend.onrender.com`).

---

### Deploy Frontend to Vercel

1. Create a free account at [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Duplisense-AI`.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-render-backend-name>.onrender.com/api`
6. Click **Deploy**.
7. Vercel will automatically build and publish your frontend with client-side SPA routing supported via `vercel.json`.

---

## 📄 License

This project was developed for academic and enterprise research purposes.
