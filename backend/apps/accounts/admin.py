from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Team

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'department', 'team', 'is_staff')
    list_filter = ('role', 'department', 'team', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    ordering = ('email',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('DupliSense Profile', {'fields': ('role', 'department', 'team', 'avatar', 'phone')}),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'created_at')
