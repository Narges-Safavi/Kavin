from django.http import Http404
from rest_framework import exceptions
from rest_framework.views import exception_handler as drf_handler


class BookingConflict(exceptions.APIException):
    status_code = 409
    default_code = "slot_taken"
    default_detail = "این بازه قبلاً رزرو شده است."


class CancellationClosed(exceptions.APIException):
    status_code = 409
    default_code = "booking_started"
    default_detail = "رزروی که شروع شده قابل لغو نیست."


def exception_handler(exc, context):
    if isinstance(exc, Http404):
        # Django's get_object_or_404 includes an untranslated model name.
        exc = exceptions.NotFound("مورد درخواستی پیدا نشد.")
    elif isinstance(exc, exceptions.ParseError):
        # Parsers can include untranslated decoder errors in the detail.
        exc = exceptions.ParseError("ساختار داده‌های ارسالی معتبر نیست.")
    response = drf_handler(exc, context)
    if response is None:
        return None
    if isinstance(exc, exceptions.ValidationError):
        response.data = {
            "code": "validation_error",
            "detail": "ورودی‌ها را بررسی کنید.",
            "errors": response.data if isinstance(response.data, dict) else {"non_field_errors": response.data},
        }
    elif isinstance(response.data, dict):
        detail = response.data.get("detail")
        response.data = {"code": getattr(detail, "code", "error"), "detail": detail or "خطایی رخ داد."}
    return response
