"""Run the real Django application against a disposable test database."""
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.conf import settings

with tempfile.TemporaryDirectory(prefix="kavin-e2e-") as directory:
    settings.DATABASES = {"default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(Path(directory) / "db.sqlite3"),
        "OPTIONS": {"timeout": 15, "transaction_mode": "IMMEDIATE"},
    }}
    import django
    django.setup()
    from django.core.management import call_command
    call_command("migrate", verbosity=0)
    call_command("loaddata", "spaces", verbosity=0)
    call_command("runserver", "127.0.0.1:8011", use_reloader=False)
