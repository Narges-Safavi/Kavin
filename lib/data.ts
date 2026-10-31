export type SpaceType = "meeting-room" | "shared-desk" | "private-office";
export type Space = {
  id: string;
  name: string;
  type: SpaceType;
  capacity: number;
  price: number;
  description: string;
  image: string;
  location: string;
  area: number;
  amenities: string[];
  tag: string;
};
export const spaces: Space[] = [
  {
    id: "1",
    name: "اتاق جلسه آفتاب",
    type: "meeting-room",
    capacity: 4,
    price: 350000,
    description:
      "یک فضای روشن برای فکرهای بزرگ. اتاقی آرام با نور طبیعی، میز جلسه و تمام چیزهایی که برای یک گفت‌وگوی سازنده نیاز دارید.",
    image: "/images/meeting.jpg",
    location: "طبقه اول، ضلع شرقی",
    area: 22,
    amenities: ["اینترنت پرسرعت", "نمایشگر", "وایت‌برد", "پذیرایی چای و قهوه"],
    tag: "مناسب جلسات تیمی",
  },
  {
    id: "2",
    name: "اتاق جلسه افق",
    type: "meeting-room",
    capacity: 10,
    price: 700000,
    description:
      "کنار هم، ایده‌ها بزرگ‌تر می‌شوند. فضای مجهز و دلباز برای ارائه، جلسه‌های تیمی و تصمیم‌هایی که به یک میز بزرگ نیاز دارند.",
    image: "/images/conference.jpg",
    location: "طبقه دوم، ضلع غربی",
    area: 40,
    amenities: ["اینترنت پرسرعت", "نمایشگر", "وایت‌برد", "پذیرایی چای و قهوه"],
    tag: "برای تیم‌های بزرگ‌تر",
  },
  {
    id: "3",
    name: "میز کار هم‌نشین",
    type: "shared-desk",
    capacity: 1,
    price: 150000,
    description:
      "جای خودت را میان آدم‌های خلاق پیدا کن. یک میز راحت در فضای مشترک، برای چند ساعت تمرکز و یک روز کاری متفاوت.",
    image: "/images/shared.jpg",
    location: "همکف، سالن مشترک",
    area: 8,
    amenities: [
      "اینترنت پرسرعت",
      "پریز اختصاصی",
      "صندلی ارگونومیک",
      "پذیرایی چای و قهوه",
    ],
    tag: "برای تمرکز و خلق کردن",
  },
  {
    id: "4",
    name: "دفتر خصوصی سرو",
    type: "private-office",
    capacity: 3,
    price: 950000,
    description:
      "آرامش یک دفتر شخصی، در دل یک جمع پویا. فضای مستقل و مجهز برای کار عمیق، همکاری نزدیک و روزهای پربازده تیم شما.",
    image: "/images/private.jpg",
    location: "طبقه دوم، ضلع شرقی",
    area: 28,
    amenities: [
      "اینترنت پرسرعت",
      "حریم خصوصی",
      "صندلی ارگونومیک",
      "پذیرایی چای و قهوه",
    ],
    tag: "آرام و مستقل",
  },
];
export const spaceTypeLabels: Record<SpaceType, string> = {
  "meeting-room": "اتاق جلسه",
  "shared-desk": "میز اشتراکی",
  "private-office": "دفتر خصوصی",
};
export type BookingStatus = "confirmed" | "cancelled";
export type Booking = {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: BookingStatus;
  total: number;
  createdAt: string;
};
export const bookings: Booking[] = [];
export async function fetchSpaces(): Promise<Space[]> {
  return spaces;
}
