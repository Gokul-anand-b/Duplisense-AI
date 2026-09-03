from rest_framework import serializers
from .models import SimilarityResult
from apps.projects.serializers import ProjectSerializer

class SimilarityResultSerializer(serializers.ModelSerializer):
    source_project = ProjectSerializer(read_only=True)
    similar_project = ProjectSerializer(read_only=True)

    class Meta:
        model = SimilarityResult
        fields = [
            'id', 'source_project', 'similar_project',
            'similarity_score', 'similarity_level',
            'matched_technologies', 'matched_concepts',
            'llm_explanation', 'created_at'
        ]
