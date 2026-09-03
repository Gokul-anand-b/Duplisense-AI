from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, DocumentExtractView, ProjectCodeUploadView
from apps.approvals.views import DownloadSourceCodeView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('extract-from-document/', DocumentExtractView.as_view(), name='project-extract-document'),
    path('<int:pk>/upload-code/', ProjectCodeUploadView.as_view(), name='project-upload-code'),
    path('<int:project_id>/download-code/', DownloadSourceCodeView.as_view(), name='project-download-code'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
]
