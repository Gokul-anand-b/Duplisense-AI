from django.db import models
from django.conf import settings
from apps.similarity.models import SimilarityResult

class Recommendation(models.Model):
    CATEGORY_CHOICES = (
        ('code', 'Code / Service Reuse'),
        ('api', 'REST / GraphQL API Reuse'),
        ('database', 'Database Schema / Vector Index'),
        ('ui', 'UI Component Library'),
        ('documentation', 'Architecture Design & Docs'),
        ('expertise', 'Team Consultation'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('implemented', 'Implemented'),
    )

    similarity_result = models.ForeignKey(SimilarityResult, on_delete=models.CASCADE, related_name='recommendations')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='code')
    description = models.TextField()
    evidence = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class CostSavings(models.Model):
    hours_saved = models.IntegerField(default=160)
    hourly_rate = models.IntegerField(default=1600)  # INR per hour
    cost_saved = models.BigIntegerField(default=256000)

    def save(self, *args, **kwargs):
        self.cost_saved = self.hours_saved * self.hourly_rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"₹{self.cost_saved:,} ({self.hours_saved} hrs)"

class Approval(models.Model):
    recommendation = models.OneToOneField(Recommendation, on_delete=models.CASCADE, related_name='approval')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='approvals')
    notes = models.TextField(blank=True, default='')
    savings = models.OneToOneField(CostSavings, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Approved: {self.recommendation.title} by {self.reviewer}"
