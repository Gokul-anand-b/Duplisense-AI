import os
import tempfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Project
from .serializers import ProjectSerializer, ProjectCreateSerializer
from apps.similarity.engine import run_similarity_scan_for_project
from .extractor import extract_from_document

class ProjectListCreateView(APIView):
    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        
        # Optional query filters
        status_filter = request.query_params.get('status')
        department_filter = request.query_params.get('department')
        search_filter = request.query_params.get('search')

        if status_filter:
            projects = projects.filter(status=status_filter)
        if department_filter:
            projects = projects.filter(department_id=department_filter)
        if search_filter:
            projects = projects.filter(title__icontains=search_filter)

        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            project = serializer.save()
            
            # Automatically run semantic similarity vector scan in background
            try:
                similarity_result = run_similarity_scan_for_project(project)
            except Exception as e:
                print(f"Similarity scan error: {e}")
                similarity_result = None

            return Response({
                'message': 'Project submitted successfully',
                'project': ProjectSerializer(project).data,
                'similarity_match_id': similarity_result.id if similarity_result else None
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetailView(APIView):
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            serializer = ProjectSerializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            serializer = ProjectCreateSerializer(project, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                return Response(ProjectSerializer(updated).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            project.delete()
            return Response({'message': 'Project deleted successfully'})
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


class DocumentExtractView(APIView):
    """
    POST /api/projects/extract-from-document/
    Extracts project metadata (title, description, problem statement, objectives,
    tech stack, repositories) from an uploaded document (PDF, DOCX, TXT)
    using the 3-layer Rule-Based Information Extraction (RBIE) pipeline.
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No document file provided. Please attach a PDF, DOCX, or TXT file.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in ['.pdf', '.docx', '.doc', '.txt', '.md']:
            return Response({'error': f'Unsupported file format: {ext}. Supported: PDF, DOCX, TXT.'}, status=status.HTTP_400_BAD_REQUEST)

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                for chunk in uploaded_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            extraction_result = extract_from_document(tmp_path)
            extraction_result['file_name'] = uploaded_file.name
            extraction_result['file_size'] = uploaded_file.size
            return Response(extraction_result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Document parsing failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass


class ProjectCodeUploadView(APIView):
    """
    POST /api/projects/<int:pk>/upload-code/
    Uploads an entire codebase (ZIP archive or folder files) for a project,
    segments it into AST functions/classes, and indexes into FAISS code vector database.
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        from .code_segmenter import ingest_zip_archive, ingest_file_list
        from apps.similarity.code_verifier import faiss_code_engine

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        zip_file = request.FILES.get('zip_file') or request.FILES.get('file')
        files = request.FILES.getlist('files')

        if zip_file and zip_file.name.lower().endswith('.zip'):
            try:
                stats = ingest_zip_archive(zip_file, project)
                faiss_code_engine.fit_and_index_all_segments()
                return Response({
                    'message': f"Successfully ingested codebase for {project.title}",
                    'stats': stats,
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': f"Failed to ingest ZIP archive: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif files:
            paths = request.data.getlist('paths') or [f.name for f in files]
            files_with_paths = list(zip(files, paths))
            try:
                stats = ingest_file_list(files_with_paths, project)
                faiss_code_engine.fit_and_index_all_segments()
                return Response({
                    'message': f"Successfully ingested {len(files)} files for {project.title}",
                    'stats': stats,
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': f"Failed to ingest files: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Please provide a ZIP archive or files to ingest.'}, status=status.HTTP_400_BAD_REQUEST)
