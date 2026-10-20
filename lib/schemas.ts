import { getTodayLocal } from "@/lib/date";
import { z } from "zod";

export function createReservationSchema (capacity: number) {
    return z
        .object({
      date: z
  .string()
  .min(1, "تاریخ را وارد کنید")
  .refine((value) => value >= getTodayLocal(), {
    message: "تاریخ نمی‌تواند در گذشته باشد",
  }),
      startTime: z.string().min(1, "ساعت شروع را وارد کنید"),
      endTime: z.string().min(1, "ساعت پایان را وارد کنید"),
      guests: z
        .number({ message: "تعداد نفرات را وارد کنید" })
        .int("تعداد نفرات باید عدد صحیح باشد")
        .min(1, "حداقل ۱ نفر")
        .max(capacity, `حداکثر ${capacity} نفر`),
        })

            .refine((data) => data.endTime > data.startTime, {
      message: "ساعت پایان باید بعد از ساعت شروع باشد",
      path: ["endTime"],
            });
}

export type ReservationFormData = z.infer<
  ReturnType<typeof createReservationSchema>
>;
