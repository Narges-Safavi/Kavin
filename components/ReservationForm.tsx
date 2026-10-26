"use client";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import { useNow } from "@/lib/use-now";
import ReservationConfirmation from "./ReservationConfirmation";
import {
  createReservationSchema,
  type ReservationFormData,
} from "@/lib/schemas";
import { type Space, type Booking, bookings as fixtures } from "@/lib/data";
import { createBooking, useBookings } from "@/lib/booking-store";
import { isSpaceAvailable } from "@/lib/availability";
import {
  formatNumber,
  formatTime,
  getBookingTotal,
  TIME_SLOTS,
  timeToMinutes,
} from "@/lib/date";
export default function ReservationForm({ space }: { space: Space }) {
  const now = useNow();
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const saved = useBookings();
  const all = [...fixtures, ...saved];
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
  const reserved = all.filter(
    (booking) =>
      booking.spaceId === space.id &&
      booking.date === date &&
      booking.status === "confirmed",
  );
  const disabledStart = TIME_SLOTS.filter(
    (time, i) =>
      time === "22:00" ||
      (date && new Date(`${date}T${time}:00`).getTime() <= now) ||
      !isSpaceAvailable(space.id, date, time, TIME_SLOTS[i + 1] ?? time, all),
  );
  const disabledEnd = TIME_SLOTS.filter(
    (time) =>
      time <= startTime ||
      !startTime ||
      !isSpaceAvailable(space.id, date, startTime, time, all),
  );
  function submit(data: ReservationFormData) {
    try {
      setConfirmed(createBooking(space.id, data));
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "ثبت رزرو ممکن نشد. دوباره تلاش کنید.",
      });
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
            {reserved.length ? (
              <>
                <Icon name="calendar" size={15} />
                <span>
                  بازه‌های رزروشده:{" "}
                  {reserved
                    .map(
                      (item) =>
                        `${formatTime(item.startTime)} تا ${formatTime(item.endTime)}`,
                    )
                    .join("، ")}
                </span>
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
        نسخه آموزشی: رزروها فقط در همین مرورگر ذخیره می‌شوند.
      </div>
    </div>
  );
}
