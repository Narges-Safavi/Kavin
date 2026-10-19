import { bookings } from "@/lib/data";

export function isTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

export function isSpaceAvailable(
  spaceId: string,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  const conflict = bookings.some(
    (booking) =>
      booking.spaceId === spaceId &&
      booking.date === date &&
      isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
  );

  return !conflict;
}