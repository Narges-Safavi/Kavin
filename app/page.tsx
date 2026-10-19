import { isSpaceAvailable } from "@/lib/availability";

export default function Home() {
  console.log(isSpaceAvailable("1", "2026-10-25", "11:00", "13:00")); // false
  console.log(isSpaceAvailable("1", "2026-10-25", "12:00", "14:00")); // true
  return <p>تست availability</p>;
}