from django.contrib import admin
from .models import SimilarityResult

@admin.register(SimilarityResult)
class SimilarityResultAdmin(admin.ModelAdmin):
    list_display = ('source_project', 'similar_project', 'similarity_score', 'similarity_level', 'created_at')
    list_filter = ('similarity_level', 'created_at')
    search_fields = ('source_project__title', 'similar_project__title')
