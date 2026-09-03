from django.urls import path
from .views import AnalyticsOverviewView

urlpatterns = [
    path('', AnalyticsOverviewView.as_view(), name='analytics-overview'),
]
