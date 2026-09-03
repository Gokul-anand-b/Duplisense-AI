from django.urls import path
from .views import SimilarityListView, SimilarityDetailView, SimilarityScanView, CodeVerificationView

urlpatterns = [
    path('', SimilarityListView.as_view(), name='similarity-list'),
    path('verify-pdf-against-code/', CodeVerificationView.as_view(), name='similarity-verify-code'),
    path('<int:pk>/', SimilarityDetailView.as_view(), name='similarity-detail'),
    path('scan/', SimilarityScanView.as_view(), name='similarity-scan'),
]
