<div dir="rtl">

# بک‌اند سیستم رزرو KAVIN

این پروژه API مستقل نسخهٔ بازطراحی‌شدهٔ KAVIN است. ثبت‌نام و ورود، فهرست فضاها، زمان‌های آزاد، محاسبهٔ مبلغ، ثبت و لغو رزرو و پنل Django Admin آماده‌اند. فرانت جدا اجرا می‌شود و اتصالش به این API در [راهنمای API](API.md) توضیح داده شده.

### راه‌اندازی روی ویندوز

پیش‌نیاز: **Python 3.12**. پوشه را از ZIP دربیار و PowerShell را کنار `manage.py` باز کن. برای اجرای محلی به Docker، PostgreSQL یا فایل تنظیمات جدا نیاز نداری.

</div>

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_demo
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

<div dir="rtl">

اگر دستور `py -3.12` روی سیستم کار نکرد، با `python --version` مطمئن شو نسخهٔ ۳.۱۲ فعال است و خط اول را با `python -m venv .venv` اجرا کن. روی macOS/Linux از `python3.12 -m venv .venv` و سپس `.venv/bin/python` به جای مسیر ویندوز استفاده کن.

- [Swagger برای امتحان API](http://127.0.0.1:8000/api/docs/)
- [دریافت OpenAPI از سرور](http://127.0.0.1:8000/api/schema/) یا [فایل داخل پروژه](openapi.yaml)
- [دیدن فضاهای نمونه](http://127.0.0.1:8000/api/v1/spaces/)
- [ورود به Django Admin](http://127.0.0.1:8000/admin/)

### دیتای نمونه و پنل ادمین

`seed_demo` چهار فضای نسخهٔ فرانت، یک کاربر معمولی به اسم `kavin-demo` و سه رزرو (آینده، گذشته و لغوشده) می‌سازد. رمز تصادفی کاربر دمو فقط دفعهٔ اول در ترمینال چاپ می‌شود. اگر یادت رفت، با `changepassword` دوباره برای همان کاربر رمز بگذار. تاریخ‌ها نسبت به روز اولین ساخت تعیین می‌شوند؛ اجرای دوبارهٔ دستور دادهٔ تکراری نمی‌سازد و تاریخ رزروهای موجود را جابه‌جا نمی‌کند.

اگر فقط فضاها را می‌خواهی، روی دیتابیس تازه `loaddata spaces` را به‌جای `seed_demo` بزن. Fixture شناسه‌های ثابت ۱ تا ۴ دارد؛ بارگذاری دوباره می‌تواند فضاهای موجود با همان شناسه‌ها را بازنویسی کند.

</div>

```powershell
.\.venv\Scripts\python.exe manage.py loaddata spaces
.\.venv\Scripts\python.exe manage.py changepassword kavin-demo
.\.venv\Scripts\python.exe manage.py createsuperuser
```

<div dir="rtl">

سه دستور بالا مستقل و اختیاری‌اند. کاربر دمو برای API است؛ برای پنل ادمین، کاربر `createsuperuser` را وارد کن. از ادمین می‌شود فضا را ساخت، قیمت و ظرفیتش را تغییر داد یا غیرفعالش کرد. رزروها در ادمین قابل مشاهده‌اند؛ ثبت و لغو از مسیر سرویس رزرو انجام می‌شود تا وضعیت بازه‌ها و مبلغ با رزرو ناسازگار نشود.

### کد کجاست؟

| فایل یا پوشه | کاربرد |
|---|---|
| `config/settings.py` | تنظیمات اجرا، دیتابیس، CORS و Swagger |
| `reservations/models.py` و `migrations/` | فضا، رزرو و قفل یکتای هر بازهٔ نیم‌ساعته |
| `reservations/services.py` | ساعت کاری، منطقهٔ زمانی، بررسی ظرفیت، مبلغ، ثبت و لغو |
| `reservations/serializers.py` | قرارداد ورودی و خروجی JSON |
| `reservations/views.py` و `urls.py` | مسیرهای API، احراز هویت و فیلترها |
| `reservations/fixtures/spaces.json` | چهار فضای نسخهٔ فرانت |
| `reservations/tests.py` | تست API و رزرو هم‌زمان |
| [API.md](API.md) | نمونهٔ درخواست‌ها، خطاها و نقشهٔ اتصال Next.js |

### تست و به‌روزرسانی قرارداد

</div>

```powershell
$env:KAVIN_TEST_SQLITE_FILE = "1"
.\.venv\Scripts\python.exe manage.py test --noinput
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py spectacular --file openapi.yaml --validate --fail-on-warn
```

<div dir="rtl">

روی SQLite این متغیر باعث می‌شود تست هم‌زمانی با فایل دیتابیس جدا اجرا شود؛ بدونش این یک تست در SQLite حافظه‌ای رد می‌شود (skip). دیتابیس اصلی دست نمی‌خورد. در macOS/Linux می‌توانی متغیر را با `export KAVIN_TEST_SQLITE_FILE=1` ست کنی.

### تنظیمات محیط

متغیرها را در محیط ترمینال/سرویس ست کن. پروژه فایل `.env` را خودکار نمی‌خواند.

| متغیر | کاربرد |
|---|---|
| `KAVIN_DEBUG` | پیش‌فرض محلی `1`؛ برای استقرار `0` |
| `KAVIN_SECRET_KEY` | کلید محرمانه؛ با `KAVIN_DEBUG=0` اجباری است |
| `KAVIN_ALLOWED_HOSTS` | نام دامنه‌ها با ویرگول؛ در توسعه localhost و 127.0.0.1 |
| `KAVIN_CORS_ORIGINS` | Origin دقیق فرانت، با پروتکل و پورت و بدون اسلش آخر؛ پیش‌فرض توسعه: localhost و 127.0.0.1 روی ۳۰۰۰ و ۳۰۰۱ |
| `KAVIN_DB_NAME` | اگر تنظیم شود PostgreSQL استفاده می‌شود؛ در غیر این صورت SQLite |
| `KAVIN_DB_USER`، `KAVIN_DB_PASSWORD`، `KAVIN_DB_HOST`، `KAVIN_DB_PORT` | تنظیمات PostgreSQL؛ میزبان و پورت پیش‌فرض 127.0.0.1 و 5432 |

برای نمونه، اگر فرانت روی ۳۰۰۴ اجراست، قبل از اجرای Django بزن: `$env:KAVIN_CORS_ORIGINS = "http://localhost:3004,http://127.0.0.1:3004"`. اگر پورت ۸۰۰۰ اشغال است، مثلاً روی ۸۰۱۰ اجرا کن و آدرس API فرانت را هم با آن پورت تنظیم کن.

برای محیط اشتراکی PostgreSQL را تنظیم کن و `migrate` را روی دیتابیس همان محیط اجرا کن. در استقرار واقعی HTTPS، سرور WSGI، سرو فایل‌های `collectstatic` و تنظیم دامنه و CORS لازم‌اند. پشت reverse proxy باید تشخیص HTTPS در Django درست تنظیم شود تا redirect تکراری نشود. `runserver` و `seed_demo` برای توسعه‌اند. این تحویل شامل پرداخت، پیامک، ارسال ایمیل، بازیابی رمز یا اتصال فرانت نیست.

</div>
