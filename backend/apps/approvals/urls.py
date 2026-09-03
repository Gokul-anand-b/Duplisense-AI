from django.urls import path
from .views import (
    RecommendationListView, RecommendationApproveView,
    RecommendationRejectView, ApprovalListView,
    RequestReuseView, DownloadSourceCodeView
)

urlpatterns = [
    path('recommendations/', RecommendationListView.as_view(), name='recommendation-list'),
    path('recommendations/<int:pk>/approve/', RecommendationApproveView.as_view(), name='recommendation-approve'),
    path('recommendations/<int:pk>/reject/', RecommendationRejectView.as_view(), name='recommendation-reject'),
    path('recommendations/<int:pk>/download-code/', DownloadSourceCodeView.as_view(), name='recommendation-download-code'),
    path('request-reuse/', RequestReuseView.as_view(), name='approval-request-reuse'),
    path('', ApprovalListView.as_view(), name='approval-list'),
]
