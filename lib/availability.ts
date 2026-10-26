import { bookings, type Booking } from "@/lib/data";
export function isTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}
export function isSpaceAvailable(
  spaceId: string,
  date: string,
  startTime: string,
  endTime: string,
  reservations: Booking[] = bookings,
): boolean {
  return !reservations.some(
    (booking) =>
      booking.status === "confirmed" &&
      booking.spaceId === spaceId &&
      booking.date === date &&
      isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime),
  );
}
