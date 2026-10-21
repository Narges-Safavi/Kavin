"use client";

import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { Space } from "@/lib/data";
import { ReservationFormData } from "@/lib/schemas";

type ReservationConfirmationProps = {
    space: Space;
    booking: ReservationFormData;
    onReset: () => void;
}
export default function ReservationConfirmation({
    space,
    booking,
    onReset,
}: ReservationConfirmationProps) {
    const displayDate = new Date (`${booking.date}T00:00`).toLocaleDateString(
        "fa-IR"
    );


return (
    <Card className="mt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font font-semibolds text-zinc-700">
                تاییدیه‌ی رزرو
            </h2>
            <Badge variant="success">رزرو آزمایشی</Badge>
        </div>
    
     <dl className="mt-4 space-y-2 text-sm text-zinc-700">
        <div className="flex justify-between">
          <dt>فضا</dt>
          <dd className="font-medium">{space.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt>تاریخ</dt>
          <dd className="font-medium">{displayDate}</dd>
        </div>
        <div className="flex justify-between">
          <dt>ساعت</dt>
          <dd className="font-medium">
            {booking.startTime} تا {booking.endTime}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>تعداد نفرات</dt>
          <dd className="font-medium">
            {booking.guests.toLocaleString("fa-IR")} نفر
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>قیمت</dt>
          <dd className="font-medium">
            {space.price.toLocaleString("fa-IR")} تومان
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-zinc-500">
        این یک رزرو آزمایشی است و در جایی ذخیره نمی‌شود.
      </p>

      <Button variant="secondary" className="mt-4 w-full" onClick={onReset}>
        ثبت رزرو دیگر
      </Button>
    
    </Card>

)
}