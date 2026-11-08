import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { SESSION_COOKIE, errorResponse } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const user = await apiRequest<AuthUser>("/auth/me/", { token });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // توکن باطل شده؛ کوکی را پاک کن.
      const response = NextResponse.json({ user: null });
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    return errorResponse(error);
  }
}