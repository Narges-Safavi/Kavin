"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { isSpaceAvailable } from "@/lib/availability";
import {
  createReservationSchema,
  ReservationFormData,
} from "@/lib/schemas";

type ReservationFormProps = {
  spaceId: string;
  capacity: number;
};

export default function ReservationForm({
  spaceId,
  capacity,
}: ReservationFormProps) {
  const [submitted, setSubmitted] = useState<ReservationFormData | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(createReservationSchema(capacity)),
  });

  function onSubmit(data: ReservationFormData) {
    const available = isSpaceAvailable(
      spaceId,
      data.date,
      data.startTime,
      data.endTime
    );

    if (!available) {
      setSubmitted(null);
      setError("root", { message: "این بازه‌ی زمانی قبلاً رزرو شده است." });
      return;
    }

    setSubmitted(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-6 space-y-4"
    >
      <h2 className="text-lg font-semibold">رزرو این فضا</h2>

      <Input
        id="date"
        label="تاریخ"
        type="date"
        error={errors.date?.message}
        {...register("date")}
      />
      <Input
        id="startTime"
        label="ساعت شروع"
        type="time"
        error={errors.startTime?.message}
        {...register("startTime")}
      />
      <Input
        id="endTime"
        label="ساعت پایان"
        type="time"
        error={errors.endTime?.message}
        {...register("endTime")}
      />
      <Input
        id="guests"
        label="تعداد نفرات"
        type="number"
        error={errors.guests?.message}
        {...register("guests", { valueAsNumber: true })}
      />

      {errors.root?.message && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <Button type="submit" className="w-full">
        ثبت رزرو
      </Button>

      {submitted && (
        <p className="text-sm text-green-600">
          رزرو آزمایشی ثبت شد: {submitted.date} از {submitted.startTime} تا{" "}
          {submitted.endTime}
        </p>
      )}
    </form>
  );
}