from rest_framework import serializers
from .models import SimilarityResult
from apps.projects.serializers import ProjectSerializer

class SimilarityResultSerializer(serializers.ModelSerializer):
    source_project = ProjectSerializer(read_only=True)
    similar_project = ProjectSerializer(read_only=True)
    approval_status = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    recommendation_id = serializers.SerializerMethodField()
    matching_code_count = serializers.SerializerMethodField()
    code_segments = serializers.SerializerMethodField()

    class Meta:
        model = SimilarityResult
        fields = [
            'id', 'source_project', 'similar_project',
            'similarity_score', 'similarity_level',
            'matched_technologies', 'matched_concepts',
            'llm_explanation', 'created_at',
            'approval_status', 'is_unlocked',
            'recommendation_id', 'matching_code_count',
            'code_segments'
        ]

    def get_approval_status(self, obj):
        rec = obj.recommendations.first()
        return rec.status if rec else 'not_requested'

    def get_is_unlocked(self, obj):
        rec = obj.recommendations.first()
        return rec.status == 'approved' if rec else False

    def get_recommendation_id(self, obj):
        rec = obj.recommendations.first()
        return rec.id if rec else None

    def get_matching_code_count(self, obj):
        if obj.similar_project:
            return obj.similar_project.code_segments.count()
        return 0

    def get_code_segments(self, obj):
        if obj.similar_project:
            from apps.projects.serializers import CodeSegmentSerializer
            segs = obj.similar_project.code_segments.all()[:15]
            return CodeSegmentSerializer(segs, many=True).data
        return []
