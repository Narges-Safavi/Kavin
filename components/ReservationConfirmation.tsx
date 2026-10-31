"use client";
import Link from "next/link";
import type { Space, Booking } from "@/lib/data";
import { formatNumber, formatPersianDate, formatTime } from "@/lib/date";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
export default function ReservationConfirmation({
  space,
  booking,
  onReset,
}: {
  space: Space;
  booking: Booking;
  onReset: () => void;
}) {
  return (
    <div className="booking-card confirmation">
      <div className="success-seal">
        <Icon name="check" size={34} />
      </div>
      <span className="eyebrow">جای شما آماده است</span>
      <h2>رزروت ثبت شد!</h2>
      <p>منتظر یک روز کاری خوب باش.</p>
      <span className="booking-reference">
        شناسه رزرو: <bdi>{booking.id.slice(0, 8).toUpperCase()}</bdi>
      </span>
      <dl>
        <div>
          <dt>فضا</dt>
          <dd>{space.name}</dd>
        </div>
        <div>
          <dt>تاریخ</dt>
          <dd>{formatPersianDate(booking.date, true)}</dd>
        </div>
        <div>
          <dt>ساعت</dt>
          <dd>
            {formatTime(booking.startTime)} تا {formatTime(booking.endTime)}
          </dd>
        </div>
        <div>
          <dt>تعداد نفرات</dt>
          <dd>{formatNumber(booking.guests)} نفر</dd>
        </div>
        <div className="total-row">
          <dt>مبلغ کل</dt>
          <dd>{formatNumber(booking.total)} تومان</dd>
        </div>
      </dl>
      <Link href="/bookings" className="button button-primary full-width">
        مشاهده رزروهای من
        <Icon name="arrow" size={18} />
      </Link>
      <Button variant="ghost" className="full-width" onClick={onReset}>
        ثبت یک رزرو دیگر
      </Button>
      <p className="demo-note">
        رزرو نمایشی در همین مرورگر ذخیره شده؛ نیازی به پرداخت نیست.
      </p>
    </div>
  );
}
