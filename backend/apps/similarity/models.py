from django.db import models
from apps.projects.models import Project

class SimilarityResult(models.Model):
    LEVEL_CHOICES = (
        ('high', 'High Similarity (>80%)'),
        ('medium', 'Medium Similarity (60-80%)'),
        ('partial', 'Partial Component Match (40-60%)'),
        ('low', 'Low / Unique (<40%)'),
    )

    source_project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='similarity_sources')
    similar_project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='similarity_targets')

    similarity_score = models.IntegerField(help_text="Similarity percentage between 0 and 100")
    similarity_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='medium')

    matched_technologies = models.JSONField(default=list)
    matched_concepts = models.JSONField(default=list)

    llm_explanation = models.TextField(help_text="RAG-synthesized explanation of architectural overlap")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source_project.title} vs {self.similar_project.title} ({self.similarity_score}%)"
