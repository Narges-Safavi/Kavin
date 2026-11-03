"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { signupSchema, type SignupFormData } from "@/lib/schemas";
import { signUp } from "@/lib/auth";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function submit(data: SignupFormData) {
    try {
      await signUp(data);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "ثبت‌نام ممکن نشد. دوباره تلاش کنید.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="card">
      <Input
        id="name"
        type="text"
        label="نام"
        error={errors.name?.message}
        {...register("name")}
      />
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </Button>
    </form>
  );
}