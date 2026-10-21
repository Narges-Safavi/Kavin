import Link from "next/link";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

const features = [
  {
    title: "جستجوی آسان",
    text: "فضاها را بر اساس نام و ظرفیت پیدا کنید.",
  },
  {
    title: "رزرو سریع",
    text: "تاریخ و ساعت را انتخاب کنید و در چند ثانیه رزرو کنید.",
  },
  {
    title: "بدون تداخل",
    text: "فقط بازه‌های آزاد قابل رزرو هستند.",
  },
];

export default function Home() {
  return (
    <Container className="py-16">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          فضای کار مناسب‌ات را پیدا و رزرو کن
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-600">
          کاوین پلتفرمی برای رزرو اتاق جلسه، میز مشترک و دفتر کار اختصاصی است.
        </p>
        <Link
          href="/spaces"
          className="mt-8 inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-700"
        >
          مشاهده فضاها
        </Link>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <h2 className="font-semibold text-zinc-900">{feature.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{feature.text}</p>
          </Card>
        ))}
      </section>
    </Container>
  );
}