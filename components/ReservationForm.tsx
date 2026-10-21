"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ReservationConfirmation from "@/components/ReservationConfirmation";
import { isSpaceAvailable } from "@/lib/availability";
import { Space } from "@/lib/data";
import {
  createReservationSchema,
  ReservationFormData,
} from "@/lib/schemas";

type ReservationFormProps = {
  space: Space;
};

export default function ReservationForm({ space }: ReservationFormProps) {
  const [confirmed, setConfirmed] = useState<ReservationFormData | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(createReservationSchema(space.capacity)),
  });

  function onSubmit(data: ReservationFormData) {
    const available = isSpaceAvailable(
      space.id,
      data.date,
      data.startTime,
      data.endTime
    );

    if (!available) {
      setError("root", { message: "این بازه‌ی زمانی قبلاً رزرو شده است." });
      return;
    }

    setConfirmed(data);
  }

  function handleReset() {
    reset();
    setConfirmed(null);
  }

  if (confirmed) {
    return (
      <ReservationConfirmation
        space={space}
        booking={confirmed}
        onReset={handleReset}
      />
    );
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
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" className="w-full">
        ثبت رزرو
      </Button>
    </form>
  );
}