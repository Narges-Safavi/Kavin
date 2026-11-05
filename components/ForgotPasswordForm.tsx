"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./ui/Input";
import Button from "./ui/Button";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function submit(data: ForgotPasswordFormData) {
    try {
      await requestPasswordReset(data);
      setSent(true);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "درخواست ممکن نشد. دوباره تلاش کنید.",
      });
    }
  }

  if (sent)
    return (
      <div className="card" role="status">
        <h2>درخواست ثبت شد</h2>
        <p>اگر این ایمیل ثبت شده باشد، لینک بازیابی رمز برای آن ارسال می‌شود.</p>
        <div className="demo-note">
          نسخه آموزشی: هنوز ایمیلی ارسال نمی‌شود.
        </div>
      </div>
    );

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="card">
      <Input
        id="email"
        type="email"
        label="ایمیل"
        error={errors.email?.message}
        {...register("email")}
      />
      {errors.root?.message && (
        <div role="alert" className="error-notice">
          {errors.root.message}
        </div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
      </Button>
    </form>
  );
}