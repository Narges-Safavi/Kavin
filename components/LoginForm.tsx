"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function submit(data: LoginFormData) {
    setSuccess("");
    try {
      const result = await login(data);
      // موقت: در مرحله‌ی ب۲ توکن را ذخیره می‌کنیم و کاربر را هدایت می‌کنیم.
      setSuccess(`خوش آمدی ${result.user.username}!`);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.errors;
        if (fieldErrors.username?.[0])
          setError("username", { message: fieldErrors.username[0] });
        if (fieldErrors.password?.[0])
          setError("password", { message: fieldErrors.password[0] });
        if (!fieldErrors.username && !fieldErrors.password)
          setError("root", { message: error.message });
        return;
      }
      setError("root", { message: "ورود ممکن نشد. دوباره تلاش کنید." });
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
        id="password"
        type="password"
        label="رمز عبور"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root?.message && (
        <div role="alert" className="error-notice">
          {errors.root.message}
        </div>
      )}
      {success && <div role="status">{success}</div>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}