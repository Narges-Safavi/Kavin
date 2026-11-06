<div dir="rtl">

# راهنمای API برای اتصال فرانت KAVIN

**Base URL:** `http://127.0.0.1:8000/api/v1`. مسیرها اسلش آخر دارند. در [Swagger](http://127.0.0.1:8000/api/docs/) می‌توانی با **Try it out** درخواست بفرستی. [OpenAPI](openapi.yaml) قرارداد ماشین‌خوان است.

### مسیرها

| متد و مسیر | دسترسی | خروجی |
|---|---|---|
| `POST /auth/register/` | عمومی | `201` کاربر و توکن |
| `POST /auth/login/` | عمومی | `200` کاربر و توکن |
| `GET /auth/me/` | توکن | `200` کاربر فعلی |
| `POST /auth/logout/` | توکن | `204` بدون بدنه، توکن باطل می‌شود |
| `GET /spaces/` | عمومی | `200` آرایهٔ فضاهای فعال |
| `GET /spaces/{id}/` | عمومی | `200` جزئیات فضای فعال |
| `GET /spaces/{id}/availability/?date=YYYY-MM-DD` | عمومی | `200` وضعیت بازه‌های نیم‌ساعته |
| `POST /spaces/{id}/quote/` | عمومی | `200` مبلغ و آزاد بودن بازه |
| `POST /bookings/` | توکن | `201` رزرو تأییدشده |
| `GET /bookings/` | توکن | `200` فهرست صفحه‌بندی‌شدهٔ رزروهای خود کاربر |
| `GET /bookings/{id}/` | توکن | `200` جزئیات رزرو خود کاربر |
| `POST /bookings/{id}/cancel/` | توکن | `200` رزرو لغوشده |

### ورود و احراز هویت

برای ثبت‌نام JSON شامل `username`، `password` و در صورت نیاز `email` بفرست. برای ورود فقط نام کاربری و رمز را بفرست. نمونهٔ پاسخ:

</div>

```json
{
  "token": "<token>",
  "user": { "id": "3", "username": "narges-dev", "email": "narges@example.test" }
}
```

<div dir="rtl">

برای درخواست خصوصی هدر `Authorization: Token <token>` بفرست. در Swagger هم روی **Authorize** بزن و مقدار `Token <token>` را کامل وارد کن. هر حساب یک توکن فعال دارد و خروج آن توکن را برای همهٔ مصرف‌کننده‌های همان حساب باطل می‌کند. توکن دمو زمان انقضای خودکار یا refresh ندارد. توکن را در کد، URL یا لاگ نگذار. برای اتصال واقعی پیشنهاد این است که Next توکن را در کوکی HttpOnly نگه دارد و سمت سرور هدر را به Django اضافه کند؛ نمونهٔ پایین برای تست مستقیم API است.

### لیست و جزئیات فضاها

`GET /spaces/?type=meeting-room&minCapacity=4&maxPrice=800000&ordering=price`

- `search`: جست‌وجو در نام، توضیح یا موقعیت؛ متن را با `URLSearchParams` encode کن.
- `type`: یکی از `meeting-room`، `shared-desk`، `private-office`.
- `minCapacity`: حداقل تعداد نفرات؛ `maxPrice`: حداکثر قیمت ساعتی به تومان.
- `ordering`: یکی از `price`، `capacity`، `name`. پیشوند `-` یعنی نزولی. پیش‌فرض شناسه صعودی است.
- خروجی همان فیلدهای `Space` فرانت است. `image` در دیتای دمو مسیر نسبی مثل `/images/meeting.jpg` است و باید از **خود Next** بارگذاری شود؛ آن را به آدرس Django نچسبان.

### تقویم، ساعت و قیمت

- به API تاریخ **میلادی** با رقم انگلیسی و فرمت `YYYY-MM-DD` بفرست؛ تقویم شمسی در UI باقی می‌ماند.
- ساعت `HH:mm` و بر اساس **Asia/Tehran** است. پنجره‌ها از ۰۸:۰۰ تا ۲۲:۰۰ و گام‌ها ۳۰ دقیقه‌اند؛ ۲۲:۰۰ فقط ساعت پایان است. شروع باید بعد از لحظهٔ فعلی باشد. برای تاریخ روز از منطقهٔ تهران استفاده کن؛ `toISOString().slice(0,10)` تاریخ UTC می‌دهد.
- خروجی availability شامل `spaceId`، `date`، `timezone`، `openingTime`، `closingTime`، `slotMinutes` و آرایهٔ `slots` است. هر آیتم مثلاً `{"startTime":"10:00","endTime":"10:30","status":"booked"}` است. فقط بازه‌های متوالی با وضعیت `available` را قابل انتخاب کن. `past` یعنی زمان شروع آن بخش رسیده یا گذشته.
- برای پیش‌نمایش قیمت، `POST /spaces/1/quote/` را با `date`، `startTime`، `endTime` و `guests` صدا بزن. پاسخ نمونه: `{"available":true,"price":350000,"total":525000,"currency":"toman"}`. `price` ساعتی است. مبلغ کل بابت کل فضا و بر اساس مدت رزرو است؛ تعداد نفرات فقط برای ظرفیت بررسی می‌شود.
- quote یا availability بازه را نگه نمی‌دارد. اگر کاربر دیگری زودتر رزرو کند، ثبت نهایی `409` برمی‌گرداند.

### ثبت رزرو و نمایش نتیجه

`POST /bookings/` با هدر توکن. برای تست، تاریخ نمونه را با یک روز آینده عوض کن. `guests` باید عدد صحیح JSON باشد. مبلغ، وضعیت و شناسهٔ کاربر را سرور تعیین می‌کند.

</div>

```json
{
  "spaceId": "1",
  "date": "2027-01-12",
  "startTime": "10:00",
  "endTime": "11:30",
  "guests": 2
}
```

```json
{
  "id": "140f7d0d-28f9-49f5-b24c-278a09185622",
  "userId": "3",
  "spaceId": "1",
  "spaceName": "اتاق جلسه آفتاب",
  "date": "2027-01-12",
  "startTime": "10:00",
  "endTime": "11:30",
  "guests": 2,
  "status": "confirmed",
  "state": "upcoming",
  "canCancel": true,
  "total": 525000,
  "createdAt": "2026-11-06T12:10:00+03:30",
  "cancelledAt": null
}
```

<div dir="rtl">

**داشبورد:** `GET /bookings/?state=upcoming&page=1&pageSize=20`. پاسخ `{count, next, previous, results}` است. `pageSize` پیش‌فرض ۲۰ و حداکثر ۱۰۰ است. می‌توانی با `status=confirmed` یا `status=cancelled` هم فیلتر کنی. `state` یکی از `upcoming`، `in_progress`، `past` و `cancelled` است. برای دکمهٔ لغو از `canCancel` استفاده کن.

**لغو:** به `POST /bookings/{id}/cancel/` بدنه نده. قبل از شروع قابل لغو است و بازه آزاد می‌شود. تکرار درخواست روی رزرو لغوشده همان نتیجه را می‌دهد. برای رزرو شروع‌شده یا گذشته، `409 booking_started` می‌گیری. شناسهٔ رزرو کاربر دیگر مثل شناسهٔ ناموجود `404` می‌دهد.

### خطاها

| وضعیت HTTP | رفتار UI |
|---|---|
| `400 validation_error` | خطای هر فیلد را از `errors` زیر همان ورودی نمایش بده. |
| `401` | برای رزرو و داشبورد کاربر را به ورود هدایت کن. برای `invalid_credentials` خطای ورود را نمایش بده. |
| `404 not_found` | فضای ناموجود/غیرفعال یا رزروی که دسترسی نداری. |
| `409 slot_taken` | وضعیت ساعت‌ها را دوباره بگیر و از کاربر بخواه ساعت دیگری انتخاب کند. |
| `409 booking_started` | لیست را به‌روز کن و امکان لغو را ببند. |
| `429 throttled` | چند لحظه صبر کن؛ هدر `Retry-After` در صورت وجود تعداد ثانیه را می‌دهد. |

نمونهٔ بدنهٔ خطا:

</div>

```json
{
  "code": "validation_error",
  "detail": "ورودی‌ها را بررسی کنید.",
  "errors": { "guests": ["ظرفیت این فضا ۴ نفر است."] }
}
```

<div dir="rtl">

### نمونهٔ تست سریع با PowerShell

سرور را اجرا کن. در Swagger یک کاربر بساز یا رمز کاربر `kavin-demo` را وارد کن. برای اینکه رمز را در تاریخچهٔ دستور ننویسی از `Get-Credential` استفاده کن. این مثال پس از ثبت، همان رزرو را لغو می‌کند.

</div>

```powershell
$api = "http://127.0.0.1:8000/api/v1"
$credentials = Get-Credential -UserName "kavin-demo" -Message "KAVIN demo login"
$body = @{ username = $credentials.UserName; password = $credentials.GetNetworkCredential().Password }
$auth = Invoke-RestMethod -Method Post "$api/auth/login/" -ContentType "application/json" -Body ($body | ConvertTo-Json)
$headers = @{ Authorization = "Token $($auth.token)" }
$tehran = [TimeZoneInfo]::FindSystemTimeZoneById("Iran Standard Time")
$day = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $tehran).AddDays(3).ToString("yyyy-MM-dd", [Globalization.CultureInfo]::InvariantCulture)
$inputJson = @{ spaceId = "1"; date = $day; startTime = "10:00"; endTime = "11:30"; guests = 2 } | ConvertTo-Json
$booking = Invoke-RestMethod -Method Post "$api/bookings/" -Headers $headers -ContentType "application/json" -Body $inputJson
Invoke-RestMethod "$api/bookings/" -Headers $headers
Invoke-RestMethod -Method Post "$api/bookings/$($booking.id)/cancel/" -Headers $headers
```

<div dir="rtl">

### ترتیب پیشنهادی اتصال به Next.js

1. یک تابع مشترک برای `fetch` بساز که Base URL، هدر JSON، توکن، پاسخ `204` و ساختار خطا را یک‌جا مدیریت کند. برای نمونه، در توسعه آدرس API را در تنظیمات فرانت بگذار: `NEXT_PUBLIC_KAVIN_API_URL=http://127.0.0.1:8000/api/v1`. فقط آدرس را در متغیر عمومی بگذار.
2. اول `fetchSpaces` و دیتای ثابت فضاها در `lib/data.ts` و مصرف‌کننده‌هایشان را با API لیست و جزئیات جایگزین کن. فیلترهای صفحه را به query همین API نگاشت کن.
3. در `components/ReservationForm.tsx` بعد از انتخاب تاریخ availability را بگیر، مبلغ را با quote نشان بده و هنگام تأیید از پاسخ ثبت نهایی استفاده کن. حین ارسال دکمه را غیرفعال کن. اگر `409` گرفتی، تایم‌اسلات‌ها را تازه کن.
4. در `app/bookings/page.tsx`، `useBookings` و `cancelBooking` محلی را با فهرست، لغو و سپس دریافت دوبارهٔ داده از API جایگزین کن. رزروهای `localStorage` نسخهٔ دمو خودکار به سرور منتقل نمی‌شوند.
5. وقتی همهٔ مصرف‌کننده‌ها مهاجرت کردند، `lib/booking-store.ts` و فیکسچرهای فرانت را جمع کن. آخر کار با دو حساب متفاوت، روی یک ساعت مشترک و روی لغو رزرو تست بگیر.

</div>
