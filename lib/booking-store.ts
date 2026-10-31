"use client";
import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";
import { spaces, bookings as fixtures, type Booking } from "@/lib/data";
import { isSpaceAvailable } from "@/lib/availability";
import {
  createReservationSchema,
  type ReservationFormData,
} from "@/lib/schemas";
import { getBookingTotal, isValidDateString } from "@/lib/date";
const KEY = "kavin.bookings.v1";
const EVENT = "kavin:bookings";
const storedBooking = z.object({
  id: z.string(),
  userId: z.string(),
  spaceId: z.string(),
  date: z.string().refine(isValidDateString),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  guests: z.number().int().positive(),
  status: z.enum(["confirmed", "cancelled"]),
  total: z.number().nonnegative(),
  createdAt: z.string(),
});
function decode(value: string): Booking[] {
  try {
    const result = z.array(storedBooking).safeParse(JSON.parse(value));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}
function readSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, callback);
  };
}
export function useBookings() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  return useMemo(() => decode(snapshot), [snapshot]);
}
function write(items: Booking[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    throw new Error(
      "ذخیره رزرو ممکن نشد. فضای ذخیره‌سازی مرورگر را بررسی کنید و دوباره تلاش کنید.",
    );
  }
  window.dispatchEvent(new Event(EVENT));
}
export function createBooking(
  spaceId: string,
  data: ReservationFormData,
): Booking {
  const space = spaces.find((item) => item.id === spaceId);
  if (!space) throw new Error("فضای انتخاب‌شده پیدا نشد.");
  const result = createReservationSchema(space.capacity).safeParse(data);
  if (!result.success) throw new Error(result.error.issues[0].message);
  const items = decode(readSnapshot());
  if (
    !isSpaceAvailable(spaceId, data.date, data.startTime, data.endTime, [
      ...fixtures,
      ...items,
    ])
  )
    throw new Error("این بازه قبلاً رزرو شده است. ساعت دیگری انتخاب کنید.");
  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    userId: "local-guest",
    spaceId,
    status: "confirmed",
    total: getBookingTotal(space.price, data.startTime, data.endTime),
    createdAt: new Date().toISOString(),
  };
  write([...items, booking]);
  return booking;
}
export function cancelBooking(id: string) {
  const items = decode(readSnapshot());
  const booking = items.find((item) => item.id === id);
  if (!booking) throw new Error("رزرو پیدا نشد.");
  if (
    new Date(`${booking.date}T${booking.startTime}:00`).getTime() <= Date.now()
  )
    throw new Error("امکان لغو رزروی که شروع شده وجود ندارد.");
  write(
    items.map((item) =>
      item.id === id ? { ...item, status: "cancelled" } : item,
    ),
  );
}
