import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  errorResponse,
  type DjangoAuthResponse,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await apiRequest<DjangoAuthResponse>("/auth/login/", {
      method: "POST",
      body,
    });
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}