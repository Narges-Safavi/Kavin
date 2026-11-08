import { apiRequest } from "@/lib/api";
import type {
  ForgotPasswordFormData,
  LoginFormData,
  SignupFormData,
} from "@/lib/schemas";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function login(data: LoginFormData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login/", {
    method: "POST",
    body: { username: data.username, password: data.password },
  });
}

export async function signUp(data: SignupFormData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register/", {
    method: "POST",
    body: {
      username: data.username,
      password: data.password,
      ...(data.email ? { email: data.email } : {}),
    },
  });
}

// بک‌اند فعلاً بازیابی رمز ندارد؛ این تابع دست‌نخورده می‌ماند.
export async function requestPasswordReset(
  data: ForgotPasswordFormData,
): Promise<void> {
  void data;
}