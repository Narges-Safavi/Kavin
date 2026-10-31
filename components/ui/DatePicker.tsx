"use client";
import { DayPicker } from "@daypicker/persian";
import "@daypicker/react/style.css";
import Picker from "./Picker";
import {
  formatDateToString,
  parseDateString,
  getTodayLocal,
  formatPersianDate,
} from "@/lib/date";
export default function DatePicker({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const selected = parseDateString(value);
  const today = new Date(`${getTodayLocal()}T00:00:00`);
  return (
    <Picker
      id={id}
      label={label}
      display={
        value ? formatPersianDate(value, true) : "یک روز خوب انتخاب کنید"
      }
      placeholder={!value}
      error={error}
      icon="calendar"
    >
      {(close) => (
        <>
          <DayPicker
            mode="single"
            dir="rtl"
            numerals="arabext"
            selected={selected}
            defaultMonth={selected ?? today}
            startMonth={today}
            disabled={{ before: today }}
            onSelect={(date) => {
              if (date) {
                onChange(formatDateToString(date));
                close();
              }
            }}
          />
          <div className="calendar-footer">
            <span>
              <i /> امروز
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(getTodayLocal());
                close();
              }}
            >
              انتخاب امروز
            </button>
          </div>
        </>
      )}
    </Picker>
  );
}
