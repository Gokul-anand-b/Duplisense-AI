from django.core.management.base import BaseCommand
from apps.accounts.models import User, Department, Team
from apps.projects.models import Project
from apps.similarity.models import SimilarityResult
from apps.approvals.models import Recommendation, Approval, CostSavings
from apps.core.models import ActivityLog

class Command(BaseCommand):
    help = 'Seeds initial database records for DupliSense AI'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database seeding..."))

        # 1. Departments
        dep_eng, _ = Department.objects.get_or_create(name='Platform Engineering', code='ENG')
        dep_ai, _ = Department.objects.get_or_create(name='AI & Data Science', code='AI')
        dep_sec, _ = Department.objects.get_or_create(name='Security & Compliance', code='SEC')

        # 2. Teams
        team_core, _ = Team.objects.get_or_create(name='Core Backend Team', department=dep_eng)
        team_rag, _ = Team.objects.get_or_create(name='NLP & RAG Specialists', department=dep_ai)
        team_sec, _ = Team.objects.get_or_create(name='Identity & Access Team', department=dep_sec)

        # 3. Users (Admin, Manager, Dev)
        admin_user, _ = User.objects.get_or_create(
            email='admin@duplisense.ai',
            defaults={
                'username': 'admin',
                'first_name': 'Alexander',
                'last_name': 'Vance',
                'role': 'admin',
                'department': dep_sec,
                'team': team_sec,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('password123')
        admin_user.save()

        manager_user, _ = User.objects.get_or_create(
            email='manager@duplisense.ai',
            defaults={
                'username': 'manager',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': 'manager',
                'department': dep_eng,
                'team': team_core,
                'is_staff': True,
            }
        )
        manager_user.set_password('password123')
        manager_user.save()

        dev_user, _ = User.objects.get_or_create(
            email='dev@duplisense.ai',
            defaults={
                'username': 'developer',
                'first_name': 'Gokul',
                'last_name': 'Natarajan',
                'role': 'developer',
                'department': dep_ai,
                'team': team_rag,
            }
        )
        dev_user.set_password('password123')
        dev_user.save()

        # 4. Enterprise Projects
        p1, _ = Project.objects.get_or_create(
            title='Autonomous Contract Analysis & RAG Ingestion Pipeline',
            defaults={
                'description': 'A microservice for parsing complex legal agreements and vendor contracts using sentence-transformers, FAISS vector indexing, and asynchronous Celery workers.',
                'problem_statement': 'Operations teams spent 40+ hours manually reviewing multi-page agreements without centralized semantic search.',
                'objectives': '1. Ingest PDF contracts at <2s latency\n2. Extract clauses with 98% accuracy\n3. Provide reusable vector search API',
                'programming_languages': ['Python', 'SQL'],
                'frameworks': ['FastAPI', 'Celery', 'React 19'],
                'database_tech': ['PostgreSQL', 'pgvector', 'Redis'],
                'apis_used': ['OpenAI API', 'AWS S3'],
                'ai_ml_tech': ['Sentence-Transformers all-MiniLM-L6-v2', 'FAISS Index', 'Llama-3-70B'],
                'status': 'completed',
                'author': dev_user,
                'department': dep_ai,
                'team': team_rag,
                'github_url': 'https://github.com/enterprise-org/contract-rag',
            }
        )

        p2, _ = Project.objects.get_or_create(
            title='Enterprise Document Intelligence & Semantic Search Hub',
            defaults={
                'description': 'An intelligent document processing hub designed to parse financial PDFs, invoices, and contracts into dense embeddings for cross-team retrieval.',
                'problem_statement': 'Multiple departments build isolated text extraction pipelines, resulting in duplicated code and compute costs.',
                'objectives': '1. Standardize enterprise embedding representations\n2. Integrate with pgvector and Redis caching',
                'programming_languages': ['Python', 'TypeScript'],
                'frameworks': ['FastAPI', 'LangChain', 'Next.js'],
                'database_tech': ['PostgreSQL', 'pgvector', 'Redis'],
                'apis_used': ['OpenAI API', 'Azure Blob'],
                'ai_ml_tech': ['Sentence-Transformers', 'FAISS Index'],
                'status': 'active',
                'author': dev_user,
                'department': dep_eng,
                'team': team_core,
                'github_url': 'https://github.com/enterprise-org/doc-intelligence',
            }
        )

        p3, _ = Project.objects.get_or_create(
            title='Centralized SSO & OAuth2 RBAC Gateway',
            defaults={
                'description': 'High-throughput identity service managing JWT claims, team roles, and multi-tenant authorization policies.',
                'problem_statement': 'Every internal portal re-implemented proprietary authentication routines with inconsistent token validation.',
                'objectives': 'Unified zero-trust authentication gateway.',
                'programming_languages': ['Go', 'Python'],
                'frameworks': ['FastAPI', 'Gin'],
                'database_tech': ['Redis', 'PostgreSQL'],
                'apis_used': ['Okta', 'Google OAuth2'],
                'ai_ml_tech': [],
                'status': 'completed',
                'author': admin_user,
                'department': dep_sec,
                'team': team_sec,
                'github_url': 'https://github.com/enterprise-org/auth-gateway',
            }
        )

        # 5. Similarity Results
        sim1, _ = SimilarityResult.objects.get_or_create(
            source_project=p2,
            similar_project=p1,
            defaults={
                'similarity_score': 88,
                'similarity_level': 'high',
                'matched_technologies': ['FastAPI', 'Python', 'pgvector', 'Redis', 'Sentence-Transformers', 'FAISS Index'],
                'matched_concepts': ['Vector Search', 'RAG Ingestion', 'PDF Extraction', 'Embedding Pipeline'],
                'llm_explanation': 'Both systems implement near-identical sentence embedding, FAISS indexing, and document chunking logic. Reusing the Core Engine from Project #1 will prevent duplicate engineering and save ~240 development hours.',
            }
        )

        # 6. Recommendations & Approvals
        rec1, _ = Recommendation.objects.get_or_create(
            similarity_result=sim1,
            title='Reuse Sentence-Transformers Embedding Pipeline',
            defaults={
                'category': 'code',
                'description': 'Directly import the pre-built Celery task and FAISS indexer from the Contract Analysis repository.',
                'evidence': 'Shared pgvector schema and identical embedding model (all-MiniLM-L6-v2).',
                'status': 'approved',
            }
        )

        savings1, _ = CostSavings.objects.get_or_create(hours_saved=240, hourly_rate=1600)
        Approval.objects.get_or_create(
            recommendation=rec1,
            defaults={
                'reviewer': manager_user,
                'notes': 'Verified technical equivalence. Approved reuse to avoid redundant LLM ingestion build.',
                'savings': savings1
            }
        )

        # 7. Activity Logs
        ActivityLog.objects.create(user=dev_user, action='project_submitted', details='Gokul Natarajan submitted "Enterprise Document Intelligence Hub"')
        ActivityLog.objects.create(user=manager_user, action='recommendation_approved', details='Elena Rostova approved reuse of "Embedding Pipeline" (Saved ₹3,84,000)')

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with enterprise demo dataset!"))
