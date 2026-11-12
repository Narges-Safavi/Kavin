"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { ApiError } from "@/lib/api";
import {
  cancelBooking,
  getMyBookings,
  type ApiBooking,
} from "@/lib/bookings-api";
import { spaces } from "@/lib/data";
import { formatNumber, formatPersianDate, formatTime } from "@/lib/date";

type Filter = "upcoming" | "past" | "cancelled";
type Result =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bookings: ApiBooking[] };

const statusLabels = {
  upcoming: "رزرو شده",
  in_progress: "در حال انجام",
  past: "پایان یافته",
  cancelled: "لغو شده",
} as const;

function ReservationRow({
  booking,
  onChanged,
}: {
  booking: ApiBooking;
  onChanged: () => void;
}) {
  // فقط برای عکس؛ نام فضا از خود رزرو می‌آید.
  const space = spaces.find((item) => item.id === booking.spaceId);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setBusy(true);
    setError("");
    try {
      await cancelBooking(booking.id);
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "لغو رزرو ممکن نشد");
      if (e instanceof ApiError && e.code === "booking_started") onChanged();
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <article className="reservation-row">
      <Link
        href={`/spaces/${booking.spaceId}`}
        className="reservation-photo"
        tabIndex={-1}
        aria-hidden="true"
      >
        {space && <Image src={space.image} alt="" fill sizes="150px" />}
      </Link>
      <div>
        <h2>
          <Link href={`/spaces/${booking.spaceId}`}>{booking.spaceName}</Link>
        </h2>
        <span
          className={`booking-status ${booking.state === "cancelled" ? "cancelled" : ""}`}
        >
          {statusLabels[booking.state]}
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
        {booking.canCancel &&
          (confirm ? (
            <div className="cancel-confirm">
              <span>رزرو لغو شود؟</span>
              <Button variant="danger" disabled={busy} onClick={handleCancel}>
                {busy ? "در حال لغو..." : "بله، لغو کن"}
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
  const router = useRouter();
  const [result, setResult] = useState<Result>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<Filter>("upcoming");

  useEffect(() => {
    let cancelled = false;
    getMyBookings()
      .then((bookings) => {
        if (!cancelled) setResult({ status: "ready", bookings });
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }
        setResult({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "دریافت رزروها ممکن نشد.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, router]);

  const reload = () => setReloadKey((key) => key + 1);
  const retry = () => {
    setResult({ status: "loading" });
    reload();
  };

  const filtered =
    result.status === "ready"
      ? result.bookings
          .filter((booking) =>
            filter === "upcoming"
              ? booking.state === "upcoming" || booking.state === "in_progress"
              : booking.state === filter,
          )
          .sort((a, b) =>
            (a.date + a.startTime).localeCompare(b.date + b.startTime),
          )
      : [];

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
      {result.status === "loading" ? (
        <p role="status">در حال دریافت رزروها...</p>
      ) : result.status === "error" ? (
        <div>
          <div role="alert" className="error-notice">
            {result.message}
          </div>
          <Button variant="secondary" onClick={retry}>
            تلاش دوباره
          </Button>
        </div>
      ) : filtered.length ? (
        <div className="booking-list">
          {filtered.map((booking) => (
            <ReservationRow
              key={booking.id}
              booking={booking}
              onChanged={reload}
            />
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
        رزروها به حساب کاربری‌ات وصل‌اند و روی سرور ذخیره می‌شوند. رزروهای
        نسخه‌ی قبلی که فقط در مرورگر بودند منتقل نمی‌شوند.
      </p>
    </Container>
  );
}