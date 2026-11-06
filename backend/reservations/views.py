from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import serializers as s, services
from .models import Booking, Space

ERROR = s.ErrorSerializer


def parsed(serializer, data, **kwargs):
    form = serializer(data=data, **kwargs)
    form.is_valid(raise_exception=True)
    return form.validated_data


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    @extend_schema(request=s.RegisterSerializer, responses={201: s.AuthSerializer, 400: ERROR, 429: ERROR})
    def post(self, request):
        form = s.RegisterSerializer(data=request.data)
        form.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                data = s.auth_payload(form.save())
        except IntegrityError:
            if get_user_model().objects.filter(username=form.validated_data["username"]).exists():
                raise ValidationError({"username": "این نام کاربری قبلاً ثبت شده است."})
            raise
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def get_authenticate_header(self, request):
        return "Token"

    @extend_schema(request=s.LoginSerializer, responses={200: s.AuthSerializer, 400: ERROR, 401: ERROR, 429: ERROR})
    def post(self, request):
        user = parsed(s.LoginSerializer, request.data, context={"request": request})
        return Response(s.auth_payload(user))


class MeView(APIView):
    @extend_schema(responses={200: s.UserSerializer, 401: ERROR})
    def get(self, request):
        return Response(s.UserSerializer(request.user).data)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None, 401: ERROR})
    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicSpaceView:
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = s.SpaceSerializer
    queryset = Space.objects.filter(is_active=True)

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])


class SpaceListView(PublicSpaceView, generics.ListAPIView):
    @extend_schema(parameters=[s.SpaceQuerySerializer], responses={200: s.SpaceSerializer(many=True), 400: ERROR})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        data = parsed(s.SpaceQuerySerializer, self.request.query_params)
        qs = super().get_queryset()
        if text := data.get("search"):
            qs = qs.filter(Q(name__icontains=text) | Q(description__icontains=text) | Q(location__icontains=text))
        if "type" in data:
            qs = qs.filter(type=data["type"])
        if "minCapacity" in data:
            qs = qs.filter(capacity__gte=data["minCapacity"])
        if "maxPrice" in data:
            qs = qs.filter(price__lte=data["maxPrice"])
        return qs.order_by(data.get("ordering", "id"), "id")


class SpaceDetailView(PublicSpaceView, generics.RetrieveAPIView):
    @extend_schema(responses={200: s.SpaceSerializer, 404: ERROR})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AvailabilityView(PublicSpaceView, generics.GenericAPIView):
    @extend_schema(parameters=[s.DateQuerySerializer], responses={200: s.AvailabilitySerializer, 400: ERROR, 404: ERROR})
    def get(self, request, pk):
        date = parsed(s.DateQuerySerializer, request.query_params)["date"]
        return Response(s.AvailabilitySerializer(services.availability(self.get_object(), date)).data)


class QuoteView(PublicSpaceView, generics.GenericAPIView):
    @extend_schema(request=s.WindowInputSerializer, responses={200: s.QuoteSerializer, 400: ERROR, 404: ERROR})
    def post(self, request, pk):
        data = parsed(s.WindowInputSerializer, request.data)
        return Response(s.QuoteSerializer(services.quote(self.get_object(), data)).data)


class BookingPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "pageSize"
    max_page_size = 100


class BookingListView(generics.ListCreateAPIView):
    serializer_class = s.BookingSerializer
    pagination_class = BookingPagination

    @extend_schema(parameters=[s.BookingQuerySerializer], responses={200: s.BookingSerializer(many=True), 400: ERROR, 401: ERROR, 404: ERROR})
    def get(self, request, *args, **kwargs):
        self.now = timezone.now()
        return super().get(request, *args, **kwargs)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "now": getattr(self, "now", None)}

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Booking.objects.none()
        data = parsed(s.BookingQuerySerializer, self.request.query_params)
        qs = Booking.objects.filter(user=self.request.user).select_related("space")
        if "status" in data:
            qs = qs.filter(status=data["status"])
        state = data.get("state")
        if not state:
            return qs
        if state == "cancelled":
            return qs.filter(status=Booking.Status.CANCELLED)
        now = self.now.astimezone(services.TEHRAN)
        day, clock = now.date(), now.time()
        future = Q(date__gt=day) | Q(date=day, start_time__gt=clock)
        ended = Q(date__lt=day) | Q(date=day, end_time__lte=clock)
        active = {"upcoming": future, "past": ended, "in_progress": ~future & ~ended}
        return qs.filter(active[state], status=Booking.Status.CONFIRMED)

    @extend_schema(request=s.BookingInputSerializer, responses={201: s.BookingSerializer, 400: ERROR, 401: ERROR, 404: ERROR, 409: ERROR})
    def post(self, request, *args, **kwargs):
        booking = services.create_booking(request.user, parsed(s.BookingInputSerializer, request.data))
        return Response(s.BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = s.BookingSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Booking.objects.none()
        return Booking.objects.filter(user=self.request.user).select_related("space")

    @extend_schema(responses={200: s.BookingSerializer, 401: ERROR, 404: ERROR})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CancelView(APIView):
    @extend_schema(request=None, responses={200: s.BookingSerializer, 401: ERROR, 404: ERROR, 409: ERROR})
    def post(self, request, pk):
        return Response(s.BookingSerializer(services.cancel_booking(request.user, pk)).data)
