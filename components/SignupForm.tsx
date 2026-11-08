"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { signupSchema, type SignupFormData } from "@/lib/schemas";
import { signUp } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function SignupForm() {
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function submit(data: SignupFormData) {
    setSuccess("");
    try {
      const result = await signUp(data);
      // موقت: در مرحله‌ی ب۲ توکن را ذخیره می‌کنیم و کاربر را هدایت می‌کنیم.
      setSuccess(`حساب ${result.user.username} ساخته شد.`);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.errors;
        let hasFieldError = false;
        if (fieldErrors.username?.[0]) {
          setError("username", { message: fieldErrors.username[0] });
          hasFieldError = true;
        }
        if (fieldErrors.email?.[0]) {
          setError("email", { message: fieldErrors.email[0] });
          hasFieldError = true;
        }
        if (fieldErrors.password?.[0]) {
          setError("password", { message: fieldErrors.password[0] });
          hasFieldError = true;
        }
        if (!hasFieldError) setError("root", { message: error.message });
        return;
      }
      setError("root", { message: "ثبت‌نام ممکن نشد. دوباره تلاش کنید." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="card">
      <Input
        id="username"
        type="text"
        label="نام کاربری"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        id="email"
        type="email"
        label="ایمیل (اختیاری)"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        type="password"
        label="رمز عبور"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        id="confirmPassword"
        type="password"
        label="تکرار رمز عبور"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root?.message && (
        <div role="alert" className="error-notice">
          {errors.root.message}
        </div>
      )}
      {success && <div role="status">{success}</div>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </Button>
    </form>
  );
}