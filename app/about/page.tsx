import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
export default function AboutPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="جایی برای کنار هم رشد کردن."
        description="کاوین از یک فکر ساده شروع شد: کار خوب، به فضای خوب نیاز دارد."
      />
      <article className="prose-card">
        <h2>فقط یک میز و صندلی نیست.</h2>
        <p>
          گاهی برای جلو بردن یک ایده، تنها چیزی که نیاز داری یک جای آرام،
          اینترنت خوب و کمی فاصله از شلوغی هر روز است. گاهی هم باید تمام تیم دور
          یک میز جمع شوند تا قدم بعدی روشن شود.
        </p>
        <p>
          کاوین برای همین روزهاست. فضایی برای کار مستقل، همکاری و گفت‌وگو؛ با
          امکان انتخاب ساعتی تا فقط همان‌قدر که نیاز داری، رزرو کنی.
        </p>
        <h2>فضایی برای نیازهای متفاوت</h2>
        <p>
          میز اشتراکی برای یک روز تمرکز، اتاق جلسه برای هم‌فکری و دفتر خصوصی
          برای همکاری تیمی. امکانات هر فضا و هزینه ساعتی‌اش قبل از رزرو مشخص
          است.
        </p>
        <Link className="button button-primary" href="/spaces">
          جای خودت را پیدا کن
        </Link>
      </article>
    </Container>
  );
}
