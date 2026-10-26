const pad = (n: number) => String(n).padStart(2, "0");
export function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && formatDateToString(date) === value;
}
export function parseDateString(value: string): Date | undefined {
  return isValidDateString(value) ? new Date(`${value}T12:00:00`) : undefined;
}
export const getTodayLocal = () => formatDateToString(new Date());
export function getCurrentTimeLocal(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
export function formatPersianDate(value: string, full = false): string {
  return (
    parseDateString(value)?.toLocaleDateString("fa-IR", {
      day: "numeric",
      month: "long",
      ...(full ? { weekday: "long", year: "numeric" } : {}),
    }) ?? "انتخاب تاریخ"
  );
}
export const formatNumber = (value: number) => value.toLocaleString("fa-IR");
export const formatTime = (value: string) =>
  value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
export const TIME_SLOTS = Array.from(
  { length: 29 },
  (_, i) => `${pad(8 + Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);
export function getBookingTotal(
  price: number,
  start: string,
  end: string,
): number {
  const duration = timeToMinutes(end) - timeToMinutes(start);
  return Number.isFinite(duration) && duration > 0
    ? Math.round((price * duration) / 60)
    : 0;
}
