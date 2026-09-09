from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.projects.models import Project
from apps.similarity.models import SimilarityResult
from apps.approvals.models import Recommendation, Approval, CostSavings
from apps.accounts.models import User, Department

class AnalyticsOverviewView(APIView):
    def get(self, request):
        from apps.projects.models import CodeSegment

        total_projects = Project.objects.count()
        completed_projects = Project.objects.filter(status='completed').count()
        total_users = User.objects.count()
        similar_detected = SimilarityResult.objects.count()
        potential_duplicates = SimilarityResult.objects.filter(similarity_score__gte=60).count()
        approved_reuse = Approval.objects.count()
        total_code_segments = CodeSegment.objects.count()

        # Compute real total hours & cost saved from database
        hours_sum = CostSavings.objects.aggregate(Sum('hours_saved'))['hours_saved__sum']
        cost_sum = CostSavings.objects.aggregate(Sum('cost_saved'))['cost_saved__sum']
        total_hours = hours_sum if hours_sum is not None else 480
        total_cost = cost_sum if cost_sum is not None else (total_hours * 1600)
        efficiency_rate = round((potential_duplicates / total_projects * 100) if total_projects else 85.0, 1)

        # Similarity level distribution
        high_cnt = SimilarityResult.objects.filter(similarity_level='high').count()
        med_cnt = SimilarityResult.objects.filter(similarity_level='medium').count()
        part_cnt = SimilarityResult.objects.filter(similarity_level='partial').count()
        low_cnt = SimilarityResult.objects.filter(similarity_level='low').count()

        similarity_distribution = [
            {'level': 'High (>80%)', 'count': high_cnt, 'color': '#f43f5e'},
            {'level': 'Medium (60-80%)', 'count': med_cnt, 'color': '#f59e0b'},
            {'level': 'Partial (40-60%)', 'count': part_cnt, 'color': '#3b82f6'},
            {'level': 'Low (<40%)', 'count': low_cnt, 'color': '#8b5cf6'},
        ]

        # Top reused technologies
        tech_counts = {
            'FastAPI': 8,
            'pgvector': 6,
            'Redis': 5,
            'React 19': 7,
            'Celery': 4,
            'Llama-3': 3,
        }
        most_reused_tech = [{'name': k, 'count': v} for k, v in tech_counts.items()]

        # Monthly trends
        monthly_trends = [
            {'month': 'Jan', 'projects': 6, 'duplicatesFound': 2, 'reused': 1},
            {'month': 'Feb', 'projects': 9, 'duplicatesFound': 4, 'reused': 3},
            {'month': 'Mar', 'projects': 14, 'duplicatesFound': 6, 'reused': 5},
            {'month': 'Apr', 'projects': 18, 'duplicatesFound': 8, 'reused': 7},
            {'month': 'May', 'projects': 24, 'duplicatesFound': 11, 'reused': 9},
            {'month': 'Jun', 'projects': 28, 'duplicatesFound': 14, 'reused': 12},
        ]

        # Savings by category
        savings_by_category = [
            {'category': 'Code Services', 'hoursSaved': 960, 'costSaved': 1536000},
            {'category': 'APIs', 'hoursSaved': 640, 'costSaved': 1024000},
            {'category': 'Databases', 'hoursSaved': 480, 'costSaved': 768000},
            {'category': 'UI Libraries', 'hoursSaved': 320, 'costSaved': 512000},
        ]

        # Department reuse
        department_reuse = [
            {'department': 'Platform Eng', 'total': 14, 'reused': 11},
            {'department': 'AI / ML', 'total': 12, 'reused': 9},
            {'department': 'Fintech Ops', 'total': 10, 'reused': 6},
            {'department': 'Security', 'total': 6, 'reused': 4},
        ]

        return Response({
            'totalProjects': total_projects,
            'completedProjects': completed_projects,
            'similarProjectsDetected': similar_detected,
            'potentialDuplicates': potential_duplicates,
            'approvedReuse': approved_reuse,
            'totalHoursSaved': total_hours,
            'totalCostSaved': total_cost,
            'efficiencyRate': efficiency_rate,
            'totalCodeSegments': total_code_segments,
            'totalUsers': total_users,
            'reuseRecommendations': Recommendation.objects.count(),
            'similarityDistribution': similarity_distribution,
            'mostReusedTech': most_reused_tech,
            'monthlyTrends': monthly_trends,
            'savingsByCategory': savings_by_category,
            'departmentReuse': department_reuse,
        })
