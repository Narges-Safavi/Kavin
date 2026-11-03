import type { LoginFormData, SignupFormData } from "@/lib/schemas";

// فعلاً بک‌اند نداریم. وقتی API آماده شد، فقط داخل این توابع عوض می‌شود.
export async function login(data: LoginFormData): Promise<void> {
  void data;
  throw new Error("ورود پس از اتصال به سرور فعال می‌شود.");
}

export async function signUp(data: SignupFormData): Promise<void> {
  void data;
  throw new Error("ثبت‌نام پس از اتصال به سرور فعال می‌شود.");
}