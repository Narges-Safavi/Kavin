const BASE_URL =
  process.env.NEXT_PUBLIC_KAVIN_API_URL ?? "http://127.0.0.1:8000/api/v1";

type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  code: string;
  errors: FieldErrors;

  constructor(
    status: number,
    code: string,
    message: string,
    errors: FieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
  // برای صدا زدن مسیرهای خود Next (مثل "/api/auth") به‌جای Django.
  baseUrl?: string;
};

type ErrorBody = {
  code?: string;
  detail?: string;
  errors?: FieldErrors;
};

// مسیرهای Django باید اسلش آخر داشته باشند، مثلاً "/spaces/".
// مسیرهای Next (با baseUrl) اسلش آخر ندارند، مثلاً "/login".
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Token ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${options.baseUrl ?? BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "ارتباط با سرور برقرار نشد. اتصال یا اجرای سرور را بررسی کنید.",
    );
  }

  if (response.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const body = (data ?? {}) as ErrorBody;
    throw new ApiError(
      response.status,
      body.code ?? "unknown_error",
      body.detail ?? "خطایی رخ داد. دوباره تلاش کنید.",
      body.errors ?? {},
    );
  }

  return data as T;
}