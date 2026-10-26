"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
type PickerProps = {
  id: string;
  label: string;
  display: string;
  placeholder: boolean;
  error?: string;
  icon: IconName;
  children: (close: () => void) => ReactNode;
};
export default function Picker({
  id,
  label,
  display,
  placeholder,
  error,
  icon,
  children,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const panelId = useId();
  const close = () => setOpen(false);
  useEffect(() => {
    if (!open) {
      if (restoreFocus.current) {
        trigger.current?.focus();
        restoreFocus.current = false;
      }
      return;
    }
    restoreFocus.current = true;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        restoreFocus.current = false;
        setOpen(false);
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    panel.current
      ?.querySelector<HTMLButtonElement>(
        'button[aria-pressed="true"], button:not(:disabled)',
      )
      ?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div
      ref={root}
      className="field picker"
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          restoreFocus.current = false;
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id}>{label}</label>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`input picker-trigger ${placeholder ? "placeholder" : ""} ${error ? "has-error" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen(!open)}
      >
        <Icon name={icon} />
        <span>{display}</span>
        <Icon name="chevron" size={16} className="picker-chevron" />
      </button>
      {open && (
        <div
          ref={panel}
          id={panelId}
          role="dialog"
          aria-label={label}
          className="picker-panel"
        >
          <div className="picker-panel-heading">
            <span>{label}</span>
            <button
              type="button"
              className="icon-button"
              aria-label="بستن"
              onClick={close}
            >
              <Icon name="close" size={17} />
            </button>
          </div>
          {children(close)}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
