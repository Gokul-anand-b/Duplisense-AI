from django.db import models
from django.conf import settings
from apps.accounts.models import Department, Team

class Project(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('active', 'Active Architecture Review'),
        ('completed', 'Completed / Production Ready'),
        ('archived', 'Archived'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    problem_statement = models.TextField(blank=True, default='')
    objectives = models.TextField(blank=True, default='')
    
    # Tech Stack fields
    programming_languages = models.JSONField(default=list)
    frameworks = models.JSONField(default=list)
    database_tech = models.JSONField(default=list)
    apis_used = models.JSONField(default=list)
    ai_ml_tech = models.JSONField(default=list)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    github_url = models.URLField(blank=True, null=True)
    documentation_url = models.URLField(blank=True, null=True)

    # Relationships
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_projects')
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='projects')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='projects')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def all_technologies(self):
        """Aggregate all technical tags into a single clean list"""
        techs = []
        for group in [self.programming_languages, self.frameworks, self.database_tech, self.apis_used, self.ai_ml_tech]:
            if isinstance(group, list):
                techs.extend(group)
            elif isinstance(group, str) and group:
                techs.extend([t.strip() for t in group.split(',') if t.strip()])
        return list(dict.fromkeys(techs))

class ProjectDocument(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='project_docs/', blank=True, null=True)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.project.title})"


class ProjectSourceCode(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='source_codes')
    file_path = models.CharField(max_length=500, help_text="Relative file path within repository")
    language = models.CharField(max_length=50, default='python')
    content = models.TextField(help_text="Raw source code content")
    line_count = models.IntegerField(default=0)
    file_size = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_path} ({self.project.title})"


class CodeSegment(models.Model):
    SEGMENT_TYPE_CHOICES = (
        ('function', 'Function / Method'),
        ('class', 'Class / Module'),
        ('endpoint', 'API Endpoint Route'),
        ('general', 'Logical Code Block'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='code_segments')
    source_file = models.ForeignKey(ProjectSourceCode, on_delete=models.CASCADE, related_name='segments', null=True, blank=True)
    file_path = models.CharField(max_length=500)
    name = models.CharField(max_length=255, help_text="Function or Class name")
    segment_type = models.CharField(max_length=30, choices=SEGMENT_TYPE_CHOICES, default='function')
    docstring = models.TextField(blank=True, default='')
    code_content = models.TextField()
    signature = models.CharField(max_length=500, blank=True, default='')
    start_line = models.IntegerField(default=1)
    end_line = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.segment_type}] {self.name} in {self.file_path}"
