import { z } from "zod";
import { getTodayLocal, isValidDateString, timeToMinutes } from "@/lib/date";
const time = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "ساعت معتبر انتخاب کنید");
export function createReservationSchema(capacity: number) {
  return z
    .object({
      date: z
        .string()
        .refine(isValidDateString, "یک تاریخ معتبر انتخاب کنید")
        .refine(
          (value) => value >= getTodayLocal(),
          "تاریخ نمی‌تواند در گذشته باشد",
        ),
      startTime: time,
      endTime: time,
      guests: z
        .number({ message: "تعداد نفرات را وارد کنید" })
        .int("تعداد نفرات باید عدد صحیح باشد")
        .min(1, "حداقل یک نفر انتخاب کنید")
        .max(capacity, `ظرفیت این فضا ${capacity} نفر است`),
    })
    .superRefine((data, ctx) => {
      if (data.endTime <= data.startTime)
        ctx.addIssue({
          code: "custom",
          message: "ساعت پایان باید بعد از شروع باشد",
          path: ["endTime"],
        });
      if (
        timeToMinutes(data.startTime) < 480 ||
        timeToMinutes(data.endTime) > 1320
      )
        ctx.addIssue({
          code: "custom",
          message: "ساعت کاری از ۸ صبح تا ۲۲ است",
          path: ["startTime"],
        });
      if (
        isValidDateString(data.date) &&
        new Date(`${data.date}T${data.startTime}:00`).getTime() <= Date.now()
      )
        ctx.addIssue({
          code: "custom",
          message: "ساعت شروع باید در آینده باشد",
          path: ["startTime"],
        });
      if (
        [data.startTime, data.endTime].some((value) => !/:(00|30)$/.test(value))
      )
        ctx.addIssue({
          code: "custom",
          message: "زمان‌ها را در بازه‌های نیم‌ساعته انتخاب کنید",
          path: ["startTime"],
        });
    });
}
export type ReservationFormData = z.infer<
  ReturnType<typeof createReservationSchema>
>;
