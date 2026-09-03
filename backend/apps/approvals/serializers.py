from rest_framework import serializers
from .models import Recommendation, Approval, CostSavings
from apps.similarity.serializers import SimilarityResultSerializer
from apps.accounts.serializers import UserSerializer

class CostSavingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostSavings
        fields = ['id', 'hours_saved', 'hourly_rate', 'cost_saved']

class RecommendationSerializer(serializers.ModelSerializer):
    similarity_result = SimilarityResultSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            'id', 'similarity_result', 'title', 'category',
            'description', 'evidence', 'status', 'created_at'
        ]

class ApprovalSerializer(serializers.ModelSerializer):
    recommendation = RecommendationSerializer(read_only=True)
    reviewer = UserSerializer(read_only=True)
    savings = CostSavingsSerializer(read_only=True)

    class Meta:
        model = Approval
        fields = ['id', 'recommendation', 'reviewer', 'notes', 'savings', 'reviewed_at']
