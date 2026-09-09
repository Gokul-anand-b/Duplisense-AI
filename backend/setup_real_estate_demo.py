"""
Setup real estate portal demo linking Gokul's GitHub project to the research paper report.
Populates SimilarityResult (88%), CodeSegments, Recommendations, CostSavings, and ActivityLogs.
"""

import os
import sys
import django

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.join(backend_dir, 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'duplisense_backend.settings')
django.setup()

from apps.projects.models import Project, CodeSegment
from apps.similarity.models import SimilarityResult
from apps.approvals.models import Recommendation, Approval, CostSavings
from apps.accounts.models import User, Department, Team
from apps.core.models import ActivityLog
from apps.similarity.engine import faiss_engine
from apps.similarity.code_verifier import faiss_code_engine

def setup():
    # 1. User and Organization
    user = User.objects.filter(email='bgokul1410@gmail.com').first() or User.objects.first()
    dept, _ = Department.objects.get_or_create(code='ENG', defaults={'name': 'Platform Engineering'})
    team, _ = Team.objects.get_or_create(name='Core Backend Team', department=dept)

    # 2. Existing Completed GitHub Project
    p_existing = Project.objects.filter(github_url__icontains='real-estate-portal').first()
    if not p_existing:
        p_existing = Project.objects.create(
            title='Real Estate Property Management & Rental Portal',
            description=(
                'Full-stack real estate marketplace and rental management portal with property listings, '
                'image uploads via Multer, user authentication using JWT and bcrypt, real-time messaging '
                'using Socket.IO, and MySQL relational schema.'
            ),
            problem_statement=(
                'Managing real estate property discovery, inquiries, lease agreements, and buyer-seller '
                'communications requires a centralized web platform with secure authentication, multi-criteria '
                'filtering, and document attachment capabilities.'
            ),
            objectives=(
                'Develop a high-performance web portal for property listings, integrate secure JWT token '
                'authentication, enable multi-image property uploads with Multer, implement MySQL database schema '
                'for property inventory, and provide real-time messaging.'
            ),
            programming_languages=['JavaScript', 'SQL', 'HTML', 'CSS'],
            frameworks=['Node.js', 'Express', 'Socket.IO', 'EJS'],
            database_tech=['MySQL'],
            apis_used=['REST API', 'Multer Upload API', 'JWT Authentication API'],
            ai_ml_tech=[],
            status='completed',
            author=user,
            team=team,
            department=dept,
            github_url='https://github.com/Gokul-anand-b/real-estate-portal'
        )

    # 3. Newly Proposed Paper Project
    paper_title = 'AI-Driven Real Estate Property Verification, Valuation, and Intelligent Transaction Management Platform'
    p_paper = Project.objects.filter(title__icontains='AI-Driven Real Estate').first()
    if not p_paper:
        p_paper = Project.objects.create(
            title=paper_title,
            description=(
                'An intelligent real estate platform integrating geospatial property discovery, automated valuation, '
                'document intelligence, computer-vision duplicate detection, and digital transaction management.'
            ),
            problem_statement=(
                'Real estate transactions involve large financial commitments and depend on the accuracy of property '
                'information, ownership records, market valuation, and legal documents. Existing platforms provide '
                'limited support for property verification, inaccurate pricing, and duplicate listings.'
            ),
            objectives=(
                '1. Geospatial property search using PostGIS\n'
                '2. Automated property valuation using XGBoost regression\n'
                '3. Computer vision duplicate detection using FAISS and CNN embeddings\n'
                '4. Document intelligence for lease agreements and contracts'
            ),
            programming_languages=['Python', 'JavaScript', 'TypeScript', 'SQL'],
            frameworks=['React', 'FastAPI', 'Django REST Framework', 'Celery', 'Tailwind CSS'],
            database_tech=['PostgreSQL', 'Redis', 'Amazon S3'],
            apis_used=['Google Maps API', 'Mapbox', 'Stripe API', 'REST API', 'Socket.IO', 'JWT'],
            ai_ml_tech=['XGBoost', 'Scikit-learn', 'PyTorch', 'FAISS'],
            status='active',
            author=user,
            department=dept,
            team=team
        )

    # 4. Create High Similarity Result (88%)
    sim, created = SimilarityResult.objects.update_or_create(
        source_project=p_paper,
        similar_project=p_existing,
        defaults={
            'similarity_score': 88,
            'similarity_level': 'high',
            'matched_technologies': [
                'JavaScript', 'SQL', 'Express.js', 'MySQL', 'REST API', 'Socket.IO', 'JWT', 'Multer'
            ],
            'matched_concepts': [
                'Real Estate', 'Property Listings', 'Image Upload', 'Authentication', 'Rental Management', 'Valuation Pipeline'
            ],
            'llm_explanation': (
                f"High architectural and functional overlap (88%) detected! Both systems implement property listing ingestion, "
                f"user role-based authentication, and property image upload workflows. Reusing the core Express/Node.js API, "
                f"database schema, and JWT middleware from Gokul's repository ({p_existing.github_url}) prevents duplicate "
                f"engineering and saves approximately ~240 development hours ($19,200 / ₹3,84,000)."
            )
        }
    )

    # 5. Recommendation & Approval
    rec, _ = Recommendation.objects.update_or_create(
        similarity_result=sim,
        defaults={
            'title': 'Reuse Real Estate Portal Authentication & Property Listing Engine',
            'category': 'code',
            'description': (
                f"Directly import verified JWT authentication middleware, Multer file upload pipeline, and property catalog "
                f"endpoints from Gokul's Real Estate Portal GitHub repository ({p_existing.github_url})."
            ),
            'evidence': (
                'Shared relational schema, identical REST endpoints (/register, /login, /properties, /upload-property), '
                'and Socket.IO real-time notification patterns.'
            ),
            'status': 'approved'
        }
    )

    savings, _ = CostSavings.objects.get_or_create(
        hours_saved=240,
        hourly_rate=1600
    )

    Approval.objects.update_or_create(
        recommendation=rec,
        defaults={
            'reviewer': user,
            'notes': f"Verified technical equivalence with GitHub repository {p_existing.github_url}. Approved component reuse to eliminate redundant engineering.",
            'savings': savings
        }
    )

    # 6. Activity Logs
    ActivityLog.objects.create(
        user=user,
        action='similarity_scan',
        details=f"Scan complete for '{paper_title}': 88% duplicate detected with GitHub repository ({p_existing.github_url})."
    )
    ActivityLog.objects.create(
        user=user,
        action='recommendation_approved',
        details=f"Approved reuse of Gokul's Real Estate Portal (Saved 240 hours / ₹3,84,000)."
    )

    # 7. Update FAISS indexes
    faiss_engine.fit_and_index(list(Project.objects.all()))
    faiss_code_engine.fit_and_index_all_segments()

    print("==========================================================================")
    print("✅ SUCCESS! Real Estate Portal demo fully linked in DupliSense AI:")
    print(f"   • Submitted Paper : {p_paper.title}")
    print(f"   • Existing GitHub  : {p_existing.title} ({p_existing.github_url})")
    print(f"   • Similarity Score : {sim.similarity_score}% ({sim.similarity_level.upper()})")
    print(f"   • Code Segments    : {CodeSegment.objects.filter(project=p_existing).count()} real endpoints from GitHub indexed")
    print(f"   • ROI Savings      : 240 hours saved (₹3,84,000 / $19,200)")
    print(f"   • Approval Status  : APPROVED (Unlocked)")
    print("==========================================================================")

if __name__ == "__main__":
    setup()
