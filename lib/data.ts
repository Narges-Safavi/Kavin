export type SpaceType= "meeting-room" | "shared-desk" | "private-office"

export type Space= {
    id: string;
    name: string;
    type: SpaceType;
    capacity: number;
    price: number;
    description: string;
}
export const spaces: Space[] = [
  {
    id: "1",
    name: "اتاق جلسات کوچک",
    type: "meeting-room",
    capacity: 4,
    price: 350000,
    description: "اتاقی آرام و مناسب برای جلسات تیمی کوچک.",
  },
  {
    id: "2",
    name: "اتاق جلسات بزرگ",
    type: "meeting-room",
    capacity: 10,
    price: 700000,
    description: "مناسب برای جلسات بزرگ‌تر و ارائه‌های تیمی.",
  },
  {
    id: "3",
    name: "میز کار مشترک",
    type: "shared-desk",
    capacity: 1,
    price: 150000,
    description: "یک صندلی در فضای کار اشتراکی برای کار فردی.",
  },
  {
    id: "4",
    name: "دفتر کار خصوصی",
    type: "private-office",
    capacity: 3,
    price: 950000,
    description: "دفتر اختصاصی و مجزا برای تیم‌های کوچک.",
  },
];

export const spaceTypeLabels: Record<SpaceType, string> = {
  "meeting-room": "اتاق جلسه",
  "shared-desk": "میز مشترک",
  "private-office": "دفتر خصوصی",
};

export function fetchSpaces(): Promise<Space[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(spaces);
    }, 800);
  });
}
export type Booking = {
  id: string;
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
};

export const bookings: Booking[] = [
  {
    id: "b1",
    spaceId: "1",
    date: "2026-10-25",
    startTime: "10:00",
    endTime: "12:00",
    guests: 3,
  },
  {
    id: "b2",
    spaceId: "2",
    date: "2026-10-25",
    startTime: "14:00",
    endTime: "16:00",
    guests: 8,
  },
];

