import re

from django.contrib.auth import authenticate, get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from . import services
from .models import Booking, Space

User = get_user_model()


@extend_schema_field({"type": "string", "pattern": r"^[0-9]{2}:[0-9]{2}$", "example": "10:30"})
class ClockField(serializers.TimeField):
    def __init__(self, **kwargs):
        super().__init__(format="%H:%M", input_formats=["%H:%M"], **kwargs)

    def to_internal_value(self, value):
        if not isinstance(value, str) or not re.fullmatch(r"[0-9]{2}:[0-9]{2}", value):
            self.fail("invalid", format="HH:mm")
        return super().to_internal_value(value)


class CalendarDateField(serializers.DateField):
    def to_internal_value(self, value):
        if not isinstance(value, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
            self.fail("invalid", format="YYYY-MM-DD")
        return super().to_internal_value(value)


class StrictIntegerField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate(self, attrs):
        try:
            password_validation.validate_password(attrs["password"], User(username=attrs["username"], email=attrs.get("email", "")))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)

    def validate(self, attrs):
        user = authenticate(request=self.context["request"], **attrs)
        if user is None:
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("نام کاربری یا رمز عبور درست نیست.", code="invalid_credentials")
        return user


class AuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    user = UserSerializer()


def auth_payload(user):
    token, _ = Token.objects.get_or_create(user=user)
    return AuthSerializer({"token": token.key, "user": user}).data


class SpaceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    amenities = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = Space
        fields = ("id", "name", "type", "capacity", "price", "description", "image", "location", "area", "amenities", "tag")


class SpaceQuerySerializer(serializers.Serializer):
    search = serializers.CharField(max_length=150, required=False, allow_blank=True)
    type = serializers.ChoiceField(choices=Space.Type.choices, required=False)
    minCapacity = serializers.IntegerField(min_value=1, max_value=32767, required=False)
    maxPrice = serializers.IntegerField(min_value=0, max_value=2147483647, required=False)
    ordering = serializers.ChoiceField(choices=("price", "-price", "capacity", "-capacity", "name", "-name"), required=False)


class DateQuerySerializer(serializers.Serializer):
    date = CalendarDateField()


class WindowInputSerializer(serializers.Serializer):
    date = CalendarDateField()
    startTime = ClockField(source="start_time")
    endTime = ClockField(source="end_time")
    guests = StrictIntegerField(min_value=1, max_value=32767)


class BookingInputSerializer(WindowInputSerializer):
    spaceId = serializers.RegexField(r"^[1-9][0-9]{0,17}$", source="space_id", max_length=18)


class SlotSerializer(serializers.Serializer):
    startTime = ClockField()
    endTime = ClockField()
    status = serializers.ChoiceField(choices=("available", "booked", "past"))


class AvailabilitySerializer(serializers.Serializer):
    spaceId = serializers.CharField()
    date = serializers.DateField()
    timezone = serializers.CharField()
    openingTime = ClockField()
    closingTime = ClockField()
    slotMinutes = serializers.IntegerField()
    slots = SlotSerializer(many=True)


class QuoteSerializer(serializers.Serializer):
    available = serializers.BooleanField()
    price = serializers.IntegerField()
    total = serializers.IntegerField()
    currency = serializers.ChoiceField(choices=("toman",))


class BookingSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id")
    spaceId = serializers.CharField(source="space_id")
    spaceName = serializers.CharField(source="space.name")
    startTime = ClockField(source="start_time")
    endTime = ClockField(source="end_time")
    createdAt = serializers.DateTimeField(source="created_at")
    cancelledAt = serializers.DateTimeField(source="cancelled_at", allow_null=True)
    state = serializers.SerializerMethodField()
    canCancel = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ("id", "userId", "spaceId", "spaceName", "date", "startTime", "endTime", "guests",
                  "status", "state", "canCancel", "total", "createdAt", "cancelledAt")

    @extend_schema_field(serializers.ChoiceField(choices=("upcoming", "in_progress", "past", "cancelled")))
    def get_state(self, obj):
        if obj.status == Booking.Status.CANCELLED:
            return "cancelled"
        now = self.context.get("now") or timezone.now()
        if services.starts_at(obj.date, obj.start_time) > now:
            return "upcoming"
        return "past" if services.starts_at(obj.date, obj.end_time) <= now else "in_progress"

    @extend_schema_field(serializers.BooleanField())
    def get_canCancel(self, obj):
        return self.get_state(obj) == "upcoming"


class BookingQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Booking.Status.choices, required=False)
    state = serializers.ChoiceField(choices=("upcoming", "in_progress", "past", "cancelled"), required=False)


class ErrorSerializer(serializers.Serializer):
    code = serializers.CharField()
    detail = serializers.CharField()
    errors = serializers.DictField(child=serializers.ListField(child=serializers.CharField()), required=False)
