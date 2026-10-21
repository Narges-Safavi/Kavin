"use client";

import { useState } from "react";
import { DayPicker } from "@daypicker/persian";
import "@daypicker/react/style.css";
import {
  formatDateToString,
  parseDateString,
  getTodayLocal,
} from "@/lib/date";

type DatePickerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function DatePicker({
  id,
  label,
  value,
  onChange,
  error,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const errorId = `${id}-error`;
  const selected = parseDateString(value);
  const today = new Date(`${getTodayLocal()}T00:00`);

  const displayValue = selected
    ? selected.toLocaleDateString("fa-IR")
    : "انتخاب تاریخ";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-zinc-900"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={`block w-full rounded-lg border px-3 py-2 text-start text-sm sm:text-base ${
          error ? "border-red-500" : "border-zinc-300"
        } ${selected ? "text-zinc-900" : "text-zinc-500"}`}
      >
        {displayValue}
      </button>

      {open && (
        <div className="mt-2 max-w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(formatDateToString(date));
                setOpen(false);
              }
            }}
            disabled={{ before: today }}
          />
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}