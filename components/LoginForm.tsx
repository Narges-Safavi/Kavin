"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(data: LoginFormData) {
    try {
      await login(data);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error ? error.message : "ورود ممکن نشد. دوباره تلاش کنید.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="card">
      <Input
        id="email"
        type="email"
        label="ایمیل"
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
      {errors.root?.message && (
        <div role="alert" className="error-notice">
          {errors.root.message}
        </div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}