import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
export default function ContactPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="یک گفت‌وگو، شروع خوبی است."
        description="برای انتخاب فضای مناسب یا آشنایی با روند رزرو، از اینجا شروع کن."
      />
      <div className="contact-grid">
        <div className="card">
          <Icon name="spark" size={30} />
          <h2>سؤالی درباره رزرو داری؟</h2>
          <p>
            روش انتخاب ساعت، امکانات فضاها و قوانین لغو را در راهنمای رزرو توضیح
            داده‌ایم.
          </p>
          <Link className="button button-secondary" href="/faq">
            پاسخ سؤال‌ها را ببین
          </Link>
        </div>
        <div className="card">
          <Icon name="briefcase" size={30} />
          <h2>درباره این نسخه</h2>
          <p>
            کاوین فعلاً یک پروژه آموزشی است. کانال پشتیبانی و اطلاعات محل پس از
            اتصال به کسب‌وکار واقعی در این صفحه قرار می‌گیرد.
          </p>
          <Link className="button button-secondary" href="/spaces">
            مشاهده فضاهای نمونه
          </Link>
        </div>
      </div>
    </Container>
  );
}
