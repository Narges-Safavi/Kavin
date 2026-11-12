"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import ReservationConfirmation from "./ReservationConfirmation";
import {
  createReservationSchema,
  type ReservationFormData,
} from "@/lib/schemas";
import type { Space, Booking } from "@/lib/data";
import { ApiError } from "@/lib/api";
import {
  createBooking,
  getAvailability,
  type AvailabilitySlot,
} from "@/lib/bookings-api";
import {
  formatNumber,
  formatTime,
  getBookingTotal,
  isValidDateString,
  TIME_SLOTS,
  timeToMinutes,
} from "@/lib/date";

// بازه‌های نیم‌ساعته‌ی پشت‌سرهم و رزروشده را یکی می‌کند: «۱۰:۰۰ تا ۱۱:۳۰»
function bookedRanges(slots: AvailabilitySlot[]): string[] {
  const ranges: { start: string; end: string }[] = [];
  for (const slot of slots) {
    if (slot.status !== "booked") continue;
    const last = ranges[ranges.length - 1];
    if (last && last.end === slot.startTime) last.end = slot.endTime;
    else ranges.push({ start: slot.startTime, end: slot.endTime });
  }
  return ranges.map(
    (range) => `${formatTime(range.start)} تا ${formatTime(range.end)}`,
  );
}

export default function ReservationForm({ space }: { space: Space }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [availability, setAvailability] = useState<{
    key: string;
    slots: AvailabilitySlot[] | null;
  } | null>(null);
  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(createReservationSchema(space.capacity)),
    defaultValues: { date: "", startTime: "", endTime: "", guests: 1 },
  });
  const {
    date = "",
    startTime = "",
    endTime = "",
    guests = 1,
  } = useWatch({ control });
  const total = getBookingTotal(space.price, startTime, endTime);

  // ساعت‌های آزاد را از سرور می‌گیریم. نتیجه با کلید «تاریخ + شماره‌ی تازه‌سازی»
  // نگه داشته می‌شود تا بدانیم هنوز منتظر جواب این تاریخ هستیم یا نه.
  const requestKey = isValidDateString(date) ? `${date}:${reloadKey}` : "";
  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    getAvailability(space.id, date)
      .then((result) => {
        if (!cancelled)
          setAvailability({ key: requestKey, slots: result.slots });
      })
      .catch(() => {
        if (!cancelled) setAvailability({ key: requestKey, slots: null });
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, date, space.id]);

  const current = availability?.key === requestKey ? availability : null;
  const loading = requestKey !== "" && current === null;
  const failed = current !== null && current.slots === null;
  const slots = current?.slots ?? [];
  const statusByStart = new Map(slots.map((slot) => [slot.startTime, slot.status]));
  const booked = bookedRanges(slots);

  const hasDate = date !== "";
  const disabledStart = TIME_SLOTS.filter(
    (time) =>
      time === "22:00" || (hasDate && statusByStart.get(time) !== "available"),
  );
  const startIndex = TIME_SLOTS.indexOf(startTime);
  const disabledEnd = TIME_SLOTS.filter((time, index) => {
    if (!startTime || startIndex === -1 || index <= startIndex) return true;
    if (!hasDate) return false;
    // همه‌ی بازه‌های بین شروع و پایان باید آزاد باشند.
    return TIME_SLOTS.slice(startIndex, index).some(
      (t) => statusByStart.get(t) !== "available",
    );
  });

  async function submit(data: ReservationFormData) {
    try {
      const booking = await createBooking(space.id, data);
      setReloadKey((key) => key + 1);
      setConfirmed(booking);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setError("root", {
          message: "ثبت رزرو ممکن نشد. دوباره تلاش کنید.",
        });
        return;
      }
      if (error.status === 401) {
        router.push("/login");
        return;
      }
      if (error.code === "slot_taken") {
        setValue("startTime", "");
        setValue("endTime", "");
        setReloadKey((key) => key + 1);
        setError("root", {
          message: "این بازه همین الان رزرو شد. ساعت دیگری انتخاب کن.",
        });
        return;
      }
      let hasFieldError = false;
      for (const field of ["date", "startTime", "endTime", "guests"] as const) {
        const message = error.errors[field]?.[0];
        if (message) {
          setError(field, { message });
          hasFieldError = true;
        }
      }
      if (!hasFieldError) setError("root", { message: error.message });
    }
  }

  if (confirmed)
    return (
      <ReservationConfirmation
        space={space}
        booking={confirmed}
        onReset={() => {
          reset();
          setConfirmed(null);
        }}
      />
    );
  return (
    <div className="booking-card">
      <div className="booking-heading">
        <span className="eyebrow">جای خودت را رزرو کن</span>
        <div className="booking-rate">
          <strong>{formatNumber(space.price)}</strong>
          <span>
            تومان <small>/ هر ساعت</small>
          </span>
        </div>
        <p>یک انتخاب ساده، برای یک روز پربار.</p>
      </div>
      <form onSubmit={handleSubmit(submit)} noValidate className="booking-form">
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="date"
              label="تاریخ حضورت"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setValue("startTime", "");
                setValue("endTime", "");
              }}
              error={errors.date?.message}
            />
          )}
        />
        <div className="time-fields">
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                id="startTime"
                label="از ساعت"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("endTime", "");
                }}
                disabledTimes={disabledStart}
                error={errors.startTime?.message}
              />
            )}
          />
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                id="endTime"
                label="تا ساعت"
                value={field.value}
                onChange={field.onChange}
                disabledTimes={disabledEnd}
                error={errors.endTime?.message}
              />
            )}
          />
        </div>
        {date && (
          <div className="availability-note">
            {loading ? (
              <>
                <Icon name="clock" size={15} />
                <span>در حال دریافت ساعت‌های آزاد...</span>
              </>
            ) : failed ? (
              <>
                <Icon name="calendar" size={15} />
                <span>ساعت‌های آزاد دریافت نشد.</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  تلاش دوباره
                </button>
              </>
            ) : booked.length ? (
              <>
                <Icon name="calendar" size={15} />
                <span>بازه‌های رزروشده: {booked.join("، ")}</span>
              </>
            ) : (
              <>
                <Icon name="check" size={15} />
                <span>برای این روز هنوز رزروی ثبت نشده.</span>
              </>
            )}
          </div>
        )}
        <div className="field">
          <label htmlFor="guests">چند نفر هستید؟</label>
          <Controller
            name="guests"
            control={control}
            render={({ field }) => (
              <div className="guest-stepper">
                <span>
                  <Icon name="users" size={18} />
                  حداکثر {formatNumber(space.capacity)} نفر
                </span>
                <div>
                  <button
                    type="button"
                    aria-label="کاهش تعداد نفرات"
                    disabled={field.value <= 1}
                    onClick={() =>
                      field.onChange(
                        Math.max(
                          1,
                          Number.isFinite(field.value) ? field.value - 1 : 1,
                        ),
                      )
                    }
                  >
                    <Icon name="minus" size={15} />
                  </button>
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    max={space.capacity}
                    step={1}
                    value={Number.isNaN(field.value) ? "" : field.value}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? NaN : e.target.valueAsNumber,
                      )
                    }
                    aria-invalid={!!errors.guests}
                    aria-describedby={
                      errors.guests ? "guests-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    aria-label="افزایش تعداد نفرات"
                    disabled={field.value >= space.capacity}
                    onClick={() =>
                      field.onChange(
                        Math.min(
                          space.capacity,
                          Number.isFinite(field.value) ? field.value + 1 : 1,
                        ),
                      )
                    }
                  >
                    <Icon name="plus" size={15} />
                  </button>
                </div>
              </div>
            )}
          />
          {errors.guests && (
            <p className="field-error" role="alert" id="guests-error">
              {errors.guests.message}
            </p>
          )}
        </div>
        <div className="booking-summary">
          <div>
            <span>مدت حضور</span>
            <strong>
              {total
                ? `${formatNumber((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60)} ساعت`
                : "پس از انتخاب ساعت"}
            </strong>
          </div>
          <div>
            <span>تعداد نفرات</span>
            <strong>
              {Number.isFinite(guests) ? formatNumber(guests) : "—"} نفر
            </strong>
          </div>
          <div className="total-row">
            <span>مبلغ کل</span>
            <strong>
              {total ? formatNumber(total) : "—"} <small>تومان</small>
            </strong>
          </div>
        </div>
        {errors.root?.message && (
          <div role="alert" className="error-notice">
            {errors.root.message}
          </div>
        )}
        <Button type="submit" disabled={isSubmitting} className="full-width">
          {isSubmitting ? "در حال ثبت..." : "تأیید و ثبت رزرو"}
          <Icon name="arrow" size={18} />
        </Button>
        <p className="booking-reassurance">
          <Icon name="shield" size={15} />
          بدون پرداخت آنلاین در نسخه نمایشی
        </p>
      </form>
      <div className="demo-note">
        برای ثبت رزرو باید وارد حساب کاربری‌ات شده باشی. مبلغ نهایی را سرور
        محاسبه می‌کند.
      </div>
    </div>
  );
}