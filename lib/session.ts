// این فایل فقط تو route handlerهای سمت سرور استفاده می‌شود، نه تو کامپوننت‌های کلاینت.
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

export const SESSION_COOKIE = "kavin_token";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // هفت روز
};

// شکل جواب ورود/ثبت‌نام Django.
export type DjangoAuthResponse = {
  token: string;
  user: AuthUser;
};

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { code: error.code, detail: error.message, errors: error.errors },
      { status: error.status === 0 ? 502 : error.status },
    );
  }
  return NextResponse.json(
    { code: "unknown_error", detail: "خطایی رخ داد. دوباره تلاش کنید." },
    { status: 500 },
  );
}