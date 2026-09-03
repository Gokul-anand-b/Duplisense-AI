from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import SimilarityResult
from .serializers import SimilarityResultSerializer
from apps.projects.models import Project
from .engine import compute_similarity, run_similarity_scan_for_project

class SimilarityListView(APIView):
    def get(self, request):
        results = SimilarityResult.objects.all().order_by('-similarity_score')
        serializer = SimilarityResultSerializer(results, many=True)
        return Response(serializer.data)

class SimilarityDetailView(APIView):
    def get(self, request, pk):
        try:
            result = SimilarityResult.objects.get(pk=pk)
            serializer = SimilarityResultSerializer(result)
            return Response(serializer.data)
        except SimilarityResult.DoesNotExist:
            return Response({'error': 'Similarity result not found'}, status=status.HTTP_404_NOT_FOUND)

class SimilarityScanView(APIView):
    def post(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(pk=project_id)
            result = run_similarity_scan_for_project(project)
            if result:
                return Response(SimilarityResultSerializer(result).data)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


class CodeVerificationView(APIView):
    """
    POST /api/similarity/verify-pdf-against-code/
    Accepts an uploaded PDF/DOCX report (or JSON specification payload),
    extracts requirements, and executes cross-modal search against real code segments
    indexed in the FAISS code database.
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        import os
        import tempfile
        from apps.projects.extractor import extract_from_document
        from .code_verifier import verify_document_against_codebase

        uploaded_file = request.FILES.get('file')
        extracted_fields = None

        if uploaded_file:
            ext = os.path.splitext(uploaded_file.name)[1].lower()
            if ext not in ['.pdf', '.docx', '.doc', '.txt', '.md']:
                return Response({'error': f"Unsupported file format: {ext}"}, status=status.HTTP_400_BAD_REQUEST)

            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                    for chunk in uploaded_file.chunks():
                        tmp.write(chunk)
                    tmp_path = tmp.name

                parsed = extract_from_document(tmp_path)
                extracted_fields = parsed.get('extracted_fields', {})
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
        else:
            extracted_fields = request.data.get('extracted_fields') or request.data

        if not extracted_fields:
            return Response({'error': 'No document file or extracted specification provided.'}, status=status.HTTP_400_BAD_REQUEST)

        exclude_project_id = request.data.get('exclude_project_id')
        try:
            if exclude_project_id:
                exclude_project_id = int(exclude_project_id)
        except (ValueError, TypeError):
            exclude_project_id = None

        verification_result = verify_document_against_codebase(extracted_fields, exclude_project_id=exclude_project_id, top_k=6)
        verification_result['extracted_specifications'] = {
            'title': extracted_fields.get('title'),
            'description': extracted_fields.get('description'),
            'technologies': [
                t for group in ['programming_languages', 'frameworks', 'database_tech', 'apis_used', 'ai_ml_tech']
                for t in (extracted_fields.get(group) if isinstance(extracted_fields.get(group), list) else [])
            ]
        }

        return Response(verification_result, status=status.HTTP_200_OK)
