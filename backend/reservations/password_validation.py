from django.contrib.auth.password_validation import MinimumLengthValidator


class PersianMinimumLengthValidator(MinimumLengthValidator):
    def get_error_message(self):
        return f"رمز عبور خیلی کوتاه است. حداقل {self.min_length} کاراکتر وارد کنید."

    def get_help_text(self):
        return f"رمز عبور باید حداقل {self.min_length} کاراکتر داشته باشد."
