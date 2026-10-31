"use client";
import Picker from "./Picker";
import { formatTime, TIME_SLOTS } from "@/lib/date";
export default function TimePicker({
  id,
  label,
  value,
  onChange,
  error,
  disabledTimes = [],
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabledTimes?: string[];
}) {
  return (
    <Picker
      id={id}
      label={label}
      display={value ? formatTime(value) : "انتخاب ساعت"}
      placeholder={!value}
      error={error}
      icon="clock"
    >
      {(close) => (
        <>
          <p className="time-hint">
            ساعت کاری: ۸ صبح تا ۲۲ • بازه‌های نیم‌ساعته
          </p>
          <div className="time-grid">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={value === time}
                disabled={disabledTimes.includes(time)}
                className={`time-option ${value === time ? "selected" : ""}`}
                onClick={() => {
                  onChange(time);
                  close();
                }}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </>
      )}
    </Picker>
  );
}
