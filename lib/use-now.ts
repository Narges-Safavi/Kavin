"use client";
import { useSyncExternalStore } from "react";
function subscribe(callback: () => void) {
  const timer = setInterval(callback, 15000);
  window.addEventListener("focus", callback);
  return () => {
    clearInterval(timer);
    window.removeEventListener("focus", callback);
  };
}
// A stable clock snapshot keeps time-dependent UI fresh without impure renders.
const snapshot = () => Math.floor(Date.now() / 15000) * 15000;
export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
