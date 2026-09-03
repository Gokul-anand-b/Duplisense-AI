from django.contrib import admin
from .models import Recommendation, Approval, CostSavings

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'created_at')
    list_filter = ('category', 'status')
    search_fields = ('title', 'description', 'evidence')

@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ('recommendation', 'reviewer', 'reviewed_at')

@admin.register(CostSavings)
class CostSavingsAdmin(admin.ModelAdmin):
    list_display = ('cost_saved', 'hours_saved', 'hourly_rate')
