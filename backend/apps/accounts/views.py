from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from .models import User, Department, Team
from .serializers import UserSerializer, RegisterSerializer, DepartmentSerializer, TeamSerializer

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate by email (supports email or username field)
        try:
            user_obj = User.objects.filter(email__iexact=email).first()
            if not user_obj:
                user_obj = User.objects.filter(username__iexact=email).first()

            if user_obj and user_obj.check_password(password):
                user = user_obj
                # Attach session if available
                http_req = getattr(request, '_request', request)
                if hasattr(http_req, 'session'):
                    try:
                        login(http_req, user)
                    except Exception:
                        pass

                serializer = UserSerializer(user)
                return Response({
                    'message': 'Login successful',
                    'user': serializer.data,
                    'token': f"jwt-token-{user.id}-{user.role}"
                })
            else:
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(APIView):
    def post(self, request):
        data = request.data.copy()
        if 'username' not in data and 'email' in data:
            data['username'] = data['email'].split('@')[0]

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            user_data = UserSerializer(user).data
            return Response({
                'message': 'User registered successfully',
                'user': user_data,
                'token': f"mock-token-{user.id}-{user.role}"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        
        # Fallback to dev user for testing if session not initialized
        first_user = User.objects.first()
        if first_user:
            return Response(UserSerializer(first_user).data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

class UsersListView(APIView):
    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class DepartmentsListView(APIView):
    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

class TeamsListView(APIView):
    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)
