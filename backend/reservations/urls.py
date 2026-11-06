from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("spaces/", views.SpaceListView.as_view(), name="spaces"),
    path("spaces/<int:pk>/", views.SpaceDetailView.as_view(), name="space-detail"),
    path("spaces/<int:pk>/availability/", views.AvailabilityView.as_view(), name="availability"),
    path("spaces/<int:pk>/quote/", views.QuoteView.as_view(), name="quote"),
    path("bookings/", views.BookingListView.as_view(), name="bookings"),
    path("bookings/<uuid:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<uuid:pk>/cancel/", views.CancelView.as_view(), name="cancel"),
]
