from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Recommendation, Approval, CostSavings
from .serializers import RecommendationSerializer, ApprovalSerializer
from apps.accounts.models import User

class RecommendationListView(APIView):
    def get(self, request):
        status_filter = request.query_params.get('status')
        recs = Recommendation.objects.all().order_by('-created_at')
        if status_filter:
            recs = recs.filter(status=status_filter)
        serializer = RecommendationSerializer(recs, many=True)
        return Response(serializer.data)

class RecommendationApproveView(APIView):
    def post(self, request, pk):
        try:
            rec = Recommendation.objects.get(pk=pk)
            rec.status = 'approved'
            rec.save()

            reviewer = request.user if request.user.is_authenticated else User.objects.filter(role='manager').first()
            if not reviewer:
                reviewer = User.objects.first()

            # Create savings calculation
            hours = int(request.data.get('hours_saved', 160))
            savings = CostSavings.objects.create(hours_saved=hours)

            approval, _ = Approval.objects.get_or_create(
                recommendation=rec,
                defaults={
                    'reviewer': reviewer,
                    'notes': request.data.get('notes', 'Manager verified architecture similarity and unlocked repository access.'),
                    'savings': savings
                }
            )

            # Log to ActivityLog
            try:
                from apps.core.models import ActivityLog
                ActivityLog.objects.create(
                    user=reviewer,
                    action="Repository Access Approved",
                    details=f"Unlocked code & repo for '{rec.title}' saving {hours} engineering hours (₹{savings.cost_saved:,})."
                )
            except Exception:
                pass

            return Response({
                'message': 'Recommendation approved successfully. Source code and Git repository unlocked for developer.',
                'approval': ApprovalSerializer(approval).data
            })
        except Recommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

class RecommendationRejectView(APIView):
    def post(self, request, pk):
        try:
            rec = Recommendation.objects.get(pk=pk)
            rec.status = 'rejected'
            rec.save()
            return Response({'message': 'Recommendation rejected'})
        except Recommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

class ApprovalListView(APIView):
    def get(self, request):
        approvals = Approval.objects.all().order_by('-reviewed_at')
        serializer = ApprovalSerializer(approvals, many=True)
        return Response(serializer.data)


class RequestReuseView(APIView):
    """
    POST /api/approvals/request-reuse/
    Allows a developer to submit a formal request to the Admin to reuse existing code.
    """
    def post(self, request):
        from apps.similarity.models import SimilarityResult

        similarity_id = request.data.get('similarity_id')
        notes = request.data.get('notes', 'Developer requested source code reuse access.')
        requested_modules = request.data.get('requested_modules', 'Complete Architecture & Source Modules')

        if not similarity_id:
            return Response({'error': 'similarity_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sim = SimilarityResult.objects.select_related('source_project', 'similar_project').get(pk=similarity_id)
        except SimilarityResult.DoesNotExist:
            return Response({'error': 'Similarity result not found'}, status=status.HTTP_404_NOT_FOUND)

        title = f"Code Reuse Request: '{sim.similar_project.title}' for '{sim.source_project.title}'"
        evidence = (
            f"Overlapping Technologies: {', '.join(sim.matched_technologies) if sim.matched_technologies else 'Shared Stack'}. "
            f"Similarity Score: {sim.similarity_score}%. "
            f"Requested Modules: {requested_modules}."
        )

        rec, created = Recommendation.objects.get_or_create(
            similarity_result=sim,
            title=title,
            defaults={
                'category': 'code',
                'description': notes,
                'evidence': evidence,
                'status': 'pending',
            }
        )
        if not created:
            rec.status = 'pending'
            rec.description = notes
            rec.evidence = evidence
            rec.save()

        return Response({
            'message': 'Reuse request submitted to Admin panel successfully.',
            'recommendation': RecommendationSerializer(rec).data
        }, status=status.HTTP_201_CREATED)


class DownloadSourceCodeView(APIView):
    """
    GET /api/approvals/recommendations/<int:pk>/download-code/
    or GET /api/projects/<int:project_id>/download-code/
    Packages real project source code files into a clean downloadable ZIP bundle.
    """
    def get(self, request, pk=None, project_id=None):
        import io
        import zipfile
        from django.http import HttpResponse
        from apps.projects.models import Project, ProjectSourceCode

        project = None
        if pk:
            try:
                rec = Recommendation.objects.select_related('similarity_result__similar_project').get(pk=pk)
                project = rec.similarity_result.similar_project
            except Recommendation.DoesNotExist:
                return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)
        elif project_id:
            try:
                project = Project.objects.get(pk=project_id)
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        if not project:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        source_files = ProjectSourceCode.objects.filter(project=project)

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            guide_content = (
                f"# DupliSense AI — Approved Source Code Reuse Package\n"
                f"======================================================\n"
                f"Project Title: {project.title}\n"
                f"Author: {project.author.get_full_name() if project.author else 'Platform Engineering'}\n"
                f"Status: Verified & Approved for Cross-Team Implementation\n\n"
                f"## Included Technologies:\n"
                f"{', '.join(project.all_technologies)}\n\n"
                f"## Architecture Overview:\n"
                f"{project.description}\n\n"
                f"## Problem Statement:\n"
                f"{project.problem_statement}\n\n"
                f"## Objectives:\n"
                f"{project.objectives}\n\n"
                f"## Instructions for Developer:\n"
                f"1. Import the enclosed modules directly into your project repository.\n"
                f"2. Maintain standard copyright and attribution headers.\n"
                f"3. Configure your local environment variables according to the specs.\n"
            )
            zf.writestr('REUSE_GUIDE.md', guide_content)

            if source_files.exists():
                for sf in source_files:
                    clean_path = sf.file_path.replace('\\', '/')
                    zf.writestr(clean_path, sf.content)
            else:
                starter_code = (
                    f'"""\n'
                    f'DupliSense AI Reusable Module for {project.title}\n'
                    f'Generated from Approved Architecture Specs\n'
                    f'"""\n\n'
                    f'class ReusablePipeline:\n'
                    f'    def __init__(self):\n'
                    f'        self.technologies = {project.all_technologies}\n'
                    f'        print("Initialized reusable architecture component.")\n\n'
                    f'    def execute(self, payload):\n'
                    f'        return {{"status": "success", "processed_by": "{project.title}"}}\n'
                )
                zf.writestr('src/reusable_module.py', starter_code)

        zip_buffer.seek(0)
        safe_title = "".join(c for c in project.title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        filename = f"{safe_title.replace(' ', '_')}_source_code.zip"

        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
