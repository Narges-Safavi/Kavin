import { apiRequest } from "@/lib/api";
import type { LoginFormData, SignupFormData } from "@/lib/schemas";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

// توکن عمداً اینجا نیست: فقط تو کوکی HttpOnly می‌ماند.
export type SessionResponse = {
  user: AuthUser;
};

const LOCAL = "/api/auth";

export async function login(data: LoginFormData): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/login", {
    method: "POST",
    baseUrl: LOCAL,
    body: { username: data.username, password: data.password },
  });
}

export async function signUp(data: SignupFormData): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/register", {
    method: "POST",
    baseUrl: LOCAL,
    body: {
      username: data.username,
      password: data.password,
      ...(data.email ? { email: data.email } : {}),
    },
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/logout", { method: "POST", baseUrl: LOCAL });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const result = await apiRequest<{ user: AuthUser | null }>("/me", {
    baseUrl: LOCAL,
  });
  return result.user;
}
