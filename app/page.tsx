import Link from "next/link";
import Image from "next/image";
import SpaceCard from "@/components/SpaceCard";
import Icon from "@/components/ui/Icon";
import { spaces } from "@/lib/data";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-star">✳</span> یک جای تازه، برای شروع‌های تازه
          </span>
          <h1>
            اینجا، جایِ
            <br />
            <span>بهتر کار کردنه.</span>
          </h1>
          <p>
            یک میز برای تمرکز. یک اتاق برای هم‌فکری.
            <br />
            فضای مناسب خودت را پیدا کن و باقی‌اش را به ایده‌هایت بسپار.
          </p>
          <div className="hero-actions">
            <Link href="/spaces" className="button button-primary">
              فضای خودت رو پیدا کن
              <Icon name="arrow" size={20} />
            </Link>
            <Link href="/about" className="text-link">
              با کاوین آشنا شو
              <Icon name="chevron" size={16} />
            </Link>
          </div>
          <div className="hero-quick-facts">
            <span>
              <Icon name="check" size={16} />
              رزرو ساعتی و منعطف
            </span>
            <span>
              <Icon name="check" size={16} />
              همه امکانات، یک‌جا
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/conference.jpg"
            alt="فضای کاری روشن با میزهای اشتراکی، گیاهان و نور طبیعی"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            loading="eager"
            fetchPriority="high"
          />
          <span className="hero-image-label">
            <i />
            آماده‌ی یک روز پربار
          </span>
          <div className="hero-float">
            <span className="float-icon">
              <Icon name="leaf" size={26} />
            </span>
            <div>
              <strong>کمی آرامش. کلی ایده.</strong>
              <span>فضایی که حال کار کردن می‌دهد.</span>
            </div>
          </div>
          <span className="image-counter">
            01 <span>/ KAVIN SPACES</span>
          </span>
        </div>
      </section>
      <div className="benefit-strip">
        <div className="container">
          <span>
            <Icon name="wifi" />
            اینترنتی هم‌پای ایده‌هایت
          </span>
          <span>
            <Icon name="coffee" />
            قهوه و یک شروع خوب
          </span>
          <span>
            <Icon name="clock" />
            فقط به‌اندازه‌ی نیازت رزرو کن
          </span>
          <span>
            <Icon name="leaf" />
            فضایی برای رشد و ارتباط
          </span>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">هر کاری، فضای خودش را می‌خواهد</span>
            <h2>امروز کجا کار می‌کنی؟</h2>
            <p>از یک میز دنج تا اتاقی برای تمام تیم؛ جای شما اینجاست.</p>
          </div>
          <Link className="text-link" href="/spaces">
            همه‌ی فضاها
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="spaces-grid home-spaces">
          {spaces.slice(0, 3).map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      </section>
      <section className="container how-section">
        <div className="how-intro">
          <span className="eyebrow">ساده، مثل یک قرار کاری</span>
          <h2>
            از یک انتخاب،
            <br />
            تا یک روز متفاوت.
          </h2>
          <Link className="text-link" href="/spaces">
            شروع کنیم
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="how-steps">
          {[
            {
              title: "جای مناسب تو",
              text: "فضاها را ببین و براساس ظرفیت و نیازت انتخاب کن.",
              icon: "grid" as const,
            },
            {
              title: "زمانی که می‌خواهی",
              text: "روز، ساعت و تعداد نفرات را مشخص کن؛ بازه‌های آزاد را می‌بینی.",
              icon: "calendar" as const,
            },
            {
              title: "همه‌چیز آماده است",
              text: "جزئیات را تأیید کن و رزروت را در «رزروهای من» ببین.",
              icon: "check" as const,
            },
          ].map((step, i) => (
            <div className="how-step" key={step.title}>
              <span className="step-number">۰{i + 1}</span>
              <Icon name={step.icon} size={24} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="cta-banner">
          <div>
            <span>برای روز کاری بعدی‌ات</span>
            <h2>یک جای خوب، همه‌چیز را عوض می‌کند.</h2>
          </div>
          <Link href="/spaces" className="button button-light">
            بریم فضاها رو ببینیم
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </>
  );
}
