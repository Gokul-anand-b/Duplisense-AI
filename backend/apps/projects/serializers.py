from rest_framework import serializers
from .models import Project, ProjectDocument
from apps.accounts.serializers import UserSerializer, DepartmentSerializer, TeamSerializer

class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = ['id', 'file_name', 'file_size', 'file', 'uploaded_at']

class ProjectSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    technologies = serializers.ReadOnlyField(source='all_technologies')

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'problem_statement', 'objectives',
            'programming_languages', 'frameworks', 'database_tech', 'apis_used', 'ai_ml_tech',
            'status', 'github_url', 'documentation_url',
            'author', 'department', 'team', 'documents', 'technologies',
            'created_at', 'updated_at'
        ]

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'problem_statement', 'objectives',
            'programming_languages', 'frameworks', 'database_tech', 'apis_used', 'ai_ml_tech',
            'status', 'github_url', 'documentation_url'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        if not user.is_authenticated:
            from apps.accounts.models import User
            user = User.objects.first()

        validated_data['author'] = user
        validated_data['department'] = user.department if user else None
        validated_data['team'] = user.team if user else None
        return super().create(validated_data)
