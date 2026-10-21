function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateString(value: string): Date | undefined {
  if (!value) return undefined;
  return new Date(`${value}T00:00`);
}

export function getTodayLocal(): string {
  return formatDateToString(new Date());
}

export function getCurrentTimeLocal(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}