import { apiRequest } from "@/lib/api";
import type { Booking } from "@/lib/data";
import type { ReservationFormData } from "@/lib/schemas";

const PROXY = "/api/kavin";

export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  status: string; // "available" | "booked" | "past"
};

export type Availability = {
  spaceId: string;
  date: string;
  slots: AvailabilitySlot[];
};

export type BookingState = "upcoming" | "in_progress" | "past" | "cancelled";

export type ApiBooking = Booking & {
  spaceName: string;
  state: BookingState;
  canCancel: boolean;
  cancelledAt: string | null;
};

type BookingPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiBooking[];
};

export function getAvailability(spaceId: string, date: string) {
  return apiRequest<Availability>(
    `/spaces/${encodeURIComponent(spaceId)}/availability?date=${encodeURIComponent(date)}`,
    { baseUrl: PROXY },
  );
}

export function createBooking(spaceId: string, data: ReservationFormData) {
  return apiRequest<ApiBooking>("/bookings", {
    method: "POST",
    baseUrl: PROXY,
    body: {
      spaceId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      guests: data.guests,
    },
  });
}

// تا ۱۰۰ رزرو آخر؛ برای الان کافی است.
export async function getMyBookings(): Promise<ApiBooking[]> {
  const page = await apiRequest<BookingPage>("/bookings?pageSize=100", {
    baseUrl: PROXY,
  });
  return page.results;
}

export function cancelBooking(id: string) {
  return apiRequest<ApiBooking>(`/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    baseUrl: PROXY,
  });
}