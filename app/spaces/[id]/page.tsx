import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { spaces, spaceTypeLabels } from "@/lib/data";
import { formatNumber } from "@/lib/date";
import ReservationForm from "@/components/ReservationForm";
import Container from "@/components/ui/Container";
import Icon, { type IconName } from "@/components/ui/Icon";

// Pre-render the small demo catalog. Revisit this when spaces come from an API.
export const dynamicParams = false;
export function generateStaticParams() {
  return spaces.map((space) => ({ id: space.id }));
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = spaces.find((item) => item.id === id);
  if (!space) notFound();
  const amenityIcons: IconName[] = [
    "wifi",
    space.type === "meeting-room" ? "monitor" : "briefcase",
    "spark",
    "coffee",
  ];
  return (
    <Container className="detail-page">
      <nav className="breadcrumbs" aria-label="مسیر صفحه">
        <Link href="/">خانه</Link>
        <Icon name="chevron" size={13} />
        <Link href="/spaces">فضاهای کاری</Link>
        <Icon name="chevron" size={13} />
        <span>{space.name}</span>
      </nav>
      <div className="detail-title">
        <div>
          <span className="eyebrow">{spaceTypeLabels[space.type]}</span>
          <h1>{space.name}</h1>
          <p>
            <Icon name="pin" size={17} />
            {space.location}
            <span>•</span>
            {space.tag}
          </p>
        </div>
        <Link href="/spaces" className="text-link">
          دیدن فضاهای دیگر
          <Icon name="arrow" size={17} />
        </Link>
        <a href="#reservation" className="button button-primary mobile-reserve">
          رزرو این فضا
        </a>
      </div>
      <div className="detail-layout">
        <div className="detail-content">
          <div className="detail-photo">
            <Image
              src={space.image}
              alt={`نمای داخلی ${space.name}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 900px) 100vw, 60vw"
            />
            <span className="photo-badge">
              <i />
              جای بعدی ایده‌های شما
            </span>
          </div>
          <div className="detail-facts">
            <div>
              <Icon name="users" />
              <strong>{formatNumber(space.capacity)} نفر</strong>
              <span>ظرفیت فضا</span>
            </div>
            <div>
              <Icon name="grid" />
              <strong>{formatNumber(space.area)} متر</strong>
              <span>مساحت تقریبی</span>
            </div>
            <div>
              <Icon name="clock" />
              <strong>۸ تا ۲۲</strong>
              <span>ساعت دسترسی</span>
            </div>
          </div>
          <section className="detail-section">
            <h2>کمی بیشتر درباره این فضا</h2>
            <p>{space.description}</p>
          </section>
          <section className="detail-section">
            <h2>همه‌چیز برای یک روز خوب</h2>
            <div className="amenities-grid">
              {space.amenities.map((item, i) => (
                <span key={item}>
                  <Icon name={amenityIcons[i]} />
                  {item}
                </span>
              ))}
            </div>
          </section>
          <section className="detail-section space-rules">
            <h2>قبل از آمدن بدانید</h2>
            <p>
              <Icon name="check" size={17} />
              رزروها به‌صورت نیم‌ساعته و در ساعت کاری ثبت می‌شوند.
            </p>
            <p>
              <Icon name="check" size={17} />
              تا پیش از شروع، امکان لغو از بخش «رزروهای من» وجود دارد.
            </p>
            <p>
              <Icon name="check" size={17} />
              برای احترام به بقیه، فضا را در زمان پایان رزرو تحویل دهید.
            </p>
          </section>
        </div>
        <aside id="reservation" className="booking-aside">
          <ReservationForm space={space} />
        </aside>
      </div>
    </Container>
  );
}
