from django.contrib import admin
from .models import Project, ProjectDocument

class ProjectDocumentInline(admin.TabularInline):
    model = ProjectDocument
    extra = 0

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'team', 'department', 'status', 'created_at')
    list_filter = ('status', 'department', 'team')
    search_fields = ('title', 'description', 'problem_statement')
    inlines = [ProjectDocumentInline]

@admin.register(ProjectDocument)
class ProjectDocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'project', 'file_size', 'uploaded_at')
