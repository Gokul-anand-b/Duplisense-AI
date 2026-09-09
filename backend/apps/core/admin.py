from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'details', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('action', 'details', 'user__username')
    ordering = ('-created_at',)
