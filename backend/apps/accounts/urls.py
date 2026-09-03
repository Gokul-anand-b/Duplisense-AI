from django.urls import path
from .views import (
    LoginView, RegisterView, MeView, LogoutView,
    UsersListView, DepartmentsListView, TeamsListView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/', UsersListView.as_view(), name='users-list'),
    path('departments/', DepartmentsListView.as_view(), name='departments-list'),
    path('teams/', TeamsListView.as_view(), name='teams-list'),
]
