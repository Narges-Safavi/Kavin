"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";
import { formatPersianDate, formatTime, TIME_SLOTS } from "@/lib/date";
import styles from "./design-system.module.css";

export function ButtonExamples() {
  const [message, setMessage] = useState("یکی از دکمه‌ها را امتحان کن.");
  return (
    <>
      <div className={styles.examples}>
        <Button
          onClick={() => setMessage("عمل اصلی صفحه؛ مثلاً تأیید و ثبت رزرو.")}
        >
          ثبت رزرو
          <Icon name="arrow" size={18} />
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setMessage("عمل فرعی؛ مثلاً دیدن جزئیات یا برگشت به فهرست.")
          }
        >
          مشاهده جزئیات
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            setMessage("عمل کم‌اهمیت‌تر؛ مثلاً انصراف یا پاک‌کردن انتخاب.")
          }
        >
          انصراف
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            setMessage(
              "برای عمل مخرب، بعد از این کلیک تأیید جداگانه بگیر؛ نمونه واقعی در رزروهای من است.",
            )
          }
        >
          لغو رزرو
        </Button>
      </div>
      <div className={styles.examples}>
        <Button disabled>غیرفعال</Button>
        <Button disabled>در حال ثبت...</Button>
      </div>
      <div className={styles.lightDemo}>
        <Link href="/spaces" className="button button-light">
          دکمه روشن روی زمینه تیره
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      <p className={styles.result} role="status">
        {message}
      </p>
    </>
  );
}

export function FieldExamples() {
  const [name, setName] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <div className={styles.twoColumns}>
      <form
        className={styles.panel}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setChecked(true);
        }}
      >
        <h3>حالت معمول و خطا</h3>
        <div className={styles.fields}>
          <Input
            id="ds-name"
            label="نام شما"
            placeholder="مثلاً نرگس احمدی"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setChecked(false);
            }}
            error={
              checked && !name.trim()
                ? "اسمت را وارد کن تا ادامه بدهیم."
                : undefined
            }
          />
          <Input
            id="ds-email"
            label="ایمیل · غیرفعال"
            type="email"
            dir="ltr"
            defaultValue="name@example.com"
            disabled
          />
          <Button type="submit" variant="secondary">
            بررسی فرم نمونه
          </Button>
        </div>
        {checked && !!name.trim() && (
          <p role="status" className={styles.result}>
            مقدار ثبت شد. این نمونه چیزی ذخیره نمی‌کند.
          </p>
        )}
      </form>
      <div className={styles.panel}>
        <h3>نمونه پیام خطا</h3>
        <Input
          id="ds-guests"
          label="تعداد نفرات"
          type="number"
          defaultValue={8}
          error="ظرفیت این فضا ۴ نفر است."
        />
        <p style={{ marginTop: 18 }}>
          خطا زیر همان فیلد نمایش داده می‌شود. رنگ قرمز تنها نشانه نیست؛ متن
          باید بگوید چه چیزی را اصلاح کنیم.
        </p>
      </div>
    </div>
  );
}

export function PickerExamples() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  return (
    <div className={styles.panel}>
      <p className={styles.description}>
        این‌ها همان کامپوننت‌های فرم رزرو هستند؛ انتخاب کن، ماه را عوض کن و با
        Escape ببند. در این صفحه رزروی ثبت نمی‌شود.
      </p>
      <div className={styles.fields}>
        <DatePicker
          id="ds-date"
          label="تاریخ نمونه"
          value={date}
          onChange={setDate}
        />
        <div className="time-fields">
          <TimePicker
            id="ds-start"
            label="ساعت شروع نمونه"
            value={start}
            onChange={(value) => {
              setStart(value);
              setEnd("");
            }}
            disabledTimes={["22:00"]}
          />
          <TimePicker
            id="ds-end"
            label="ساعت پایان نمونه"
            value={end}
            onChange={setEnd}
            disabledTimes={TIME_SLOTS.filter((time) => !start || time <= start)}
          />
        </div>
      </div>
      <p className={styles.result} aria-live="polite">
        {date ? formatPersianDate(date, true) : "تاریخی انتخاب نشده"} ·{" "}
        {start ? formatTime(start) : "شروع"} تا{" "}
        {end ? formatTime(end) : "پایان"}
      </p>
      <Button
        variant="ghost"
        className="full-width"
        onClick={() => {
          setDate("");
          setStart("");
          setEnd("");
        }}
      >
        پاک کردن نمونه
      </Button>
    </div>
  );
}
