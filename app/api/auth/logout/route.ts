import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await apiRequest<void>("/auth/logout/", { method: "POST", token });
    } catch {
      // حتی اگر سرور خطا داد، کوکی را پاک می‌کنیم.
    }
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}