import type { LoginFormData } from "@/lib/schemas";

// فعلاً بک‌اند نداریم. وقتی API آماده شد، فقط داخل همین تابع عوض می‌شود.
export async function login(data: LoginFormData): Promise<void> {
  void data;
  throw new Error("ورود پس از اتصال به سرور فعال می‌شود.");
}