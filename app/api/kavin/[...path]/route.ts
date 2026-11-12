import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";
import { SESSION_COOKIE, errorResponse } from "@/lib/session";

// فقط این بخش‌های API از مرورگر قابل دسترسی‌اند.
const ALLOWED = new Set(["spaces", "bookings"]);

type Context = { params: Promise<{ path: string[] }> };

async function forward(
  request: NextRequest,
  context: Context,
  method: "GET" | "POST",
) {
  const { path } = await context.params;
  const invalid =
    !ALLOWED.has(path[0]) || path.some((part) => part === "." || part === "..");
  if (invalid) {
    return NextResponse.json(
      { code: "not_found", detail: "مسیر پیدا نشد." },
      { status: 404 },
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  try {
    let body: unknown;
    if (method === "POST") {
      const text = await request.text();
      body = text ? JSON.parse(text) : undefined;
    }
    // Django اسلش آخر می‌خواهد؛ query (مثل ?date=...) هم همراه می‌رود.
    const target = `/${path.map(encodeURIComponent).join("/")}/${request.nextUrl.search}`;
    const data = await apiRequest<unknown>(target, { method, body, token });
    if (data === undefined) return new NextResponse(null, { status: 204 });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export function GET(request: NextRequest, context: Context) {
  return forward(request, context, "GET");
}

export function POST(request: NextRequest, context: Context) {
  return forward(request, context, "POST");
}