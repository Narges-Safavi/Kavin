"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useBookings, cancelBooking } from "@/lib/booking-store";
import { useNow } from "@/lib/use-now";
import { spaces, type Booking } from "@/lib/data";
import { formatNumber, formatPersianDate, formatTime } from "@/lib/date";
type Filter = "upcoming" | "past" | "cancelled";
function ReservationRow({ booking }: { booking: Booking }) {
  const now = useNow();
  const space = spaces.find((item) => item.id === booking.spaceId);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  if (!space) return null;
  const canCancel =
    booking.status === "confirmed" &&
    new Date(`${booking.date}T${booking.startTime}:00`).getTime() > now;
  return (
    <article className="reservation-row">
      <Link
        href={`/spaces/${space.id}`}
        className="reservation-photo"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={space.image} alt="" fill sizes="150px" />
      </Link>
      <div>
        <h2>
          <Link href={`/spaces/${space.id}`}>{space.name}</Link>
        </h2>
        <span
          className={`booking-status ${booking.status === "cancelled" ? "cancelled" : ""}`}
        >
          {booking.status === "cancelled"
            ? "لغو شده"
            : canCancel
              ? "رزرو شده"
              : new Date(`${booking.date}T${booking.endTime}:00`).getTime() >
                  now
                ? "در حال انجام"
                : "پایان یافته"}
        </span>
        <div className="reservation-info">
          <span>
            <Icon name="calendar" size={15} />
            {formatPersianDate(booking.date, true)}
          </span>
          <span>
            <Icon name="clock" size={15} />
            {formatTime(booking.startTime)} تا {formatTime(booking.endTime)}
          </span>
          <span>
            <Icon name="users" size={15} />
            {formatNumber(booking.guests)} نفر
          </span>
        </div>
        <span className="booking-reference">
          شناسه: <bdi>{booking.id.slice(0, 8).toUpperCase()}</bdi>
        </span>
      </div>
      <div className="reservation-actions">
        <strong>
          {formatNumber(booking.total)} <small>تومان</small>
        </strong>
        {canCancel &&
          (confirm ? (
            <div className="cancel-confirm">
              <span>رزرو لغو شود؟</span>
              <Button
                variant="danger"
                onClick={() => {
                  try {
                    cancelBooking(booking.id);
                    setConfirm(false);
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "لغو رزرو ممکن نشد",
                    );
                  }
                }}
              >
                بله، لغو کن
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                انصراف
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              لغو رزرو
            </Button>
          ))}
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
export default function BookingsPage() {
  const now = useNow();
  const bookings = useBookings();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const filtered = bookings
    .filter((booking) => {
      const future =
        new Date(`${booking.date}T${booking.endTime}:00`).getTime() > now;
      return filter === "cancelled"
        ? booking.status === "cancelled"
        : booking.status === "confirmed" &&
            (filter === "upcoming" ? future : !future);
    })
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  return (
    <Container className="bookings-page">
      <PageHeader
        title="قرارهای کاریِ من"
        description="همه‌ی رزروهایت یک‌جا؛ برای روزهایی که می‌خواهی بهتر کار کنی."
      />
      <div className="booking-tabs" aria-label="فیلتر رزروها">
        {(
          [
            { value: "upcoming", label: "پیش رو و در حال انجام" },
            { value: "past", label: "گذشته" },
            { value: "cancelled", label: "لغو شده" },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="booking-list">
          {filtered.map((booking) => (
            <ReservationRow key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="calendar" size={32} />
          </span>
          <h2>
            {filter === "upcoming"
              ? "جای یک روز خوب خالی است"
              : "اینجا هنوز رزروی نیست"}
          </h2>
          <p>
            {filter === "upcoming"
              ? "اولین فضای کاری‌ات را انتخاب کن و یک قرار با ایده‌هایت بگذار."
              : "رزروهای این بخش بعداً اینجا نمایش داده می‌شوند."}
          </p>
          <Link className="button button-primary" href="/spaces">
            پیدا کردن فضای من
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      )}
      <p className="demo-note">
        رزروهای این نسخه متعلق به همین مرورگر هستند. ورود و اتصال به حساب کاربری
        در مرحله بعد توسعه داده می‌شود.
      </p>
    </Container>
  );
}
