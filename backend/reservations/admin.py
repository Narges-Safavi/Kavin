from django import forms
from django.contrib import admin

from .models import Booking, Space


class SpaceForm(forms.ModelForm):
    class Meta:
        model = Space
        fields = "__all__"

    def clean_amenities(self):
        items = self.cleaned_data.get("amenities")
        if items is None:
            return []
        if not isinstance(items, list) or any(not isinstance(item, str) for item in items):
            raise forms.ValidationError("امکانات باید یک آرایه از متن‌ها باشد.")
        return items


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    form = SpaceForm
    list_display = ("name", "type", "capacity", "price", "is_active")
    list_filter = ("type", "is_active")
    search_fields = ("name", "location")
    list_editable = ("is_active",)

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "space", "user", "date", "start_time", "end_time", "status", "total")
    list_filter = ("status", "date", "space")
    search_fields = ("id", "user__username", "space__name")
    date_hierarchy = "date"
    list_select_related = ("space", "user")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
