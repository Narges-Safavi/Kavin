import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import SpaceCard from "@/components/SpaceCard";
import { spaces } from "@/lib/data";
import {
  ButtonExamples,
  FieldExamples,
  PickerExamples,
} from "./InteractiveExamples";
import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: "دیزاین‌سیستم کاوین | راهنمای توسعه",
  robots: { index: false, follow: false },
};
const colors = [
  ["--primary", "سبز اصلی", "#235745"],
  ["--primary-hover", "سبز تیره", "#173e30"],
  ["--primary-soft", "سبز ملایم", "#edf3e9"],
  ["--accent", "تأکید روشن", "#d8e8b4"],
  ["--background", "زمینه صفحه", "#fbfcf9"],
  ["--surface", "زمینه کارت", "#ffffff"],
  ["--foreground", "متن اصلی", "#20382e"],
  ["--muted", "متن فرعی", "#758078"],
  ["--border", "خط و کادر", "#e1e6dd"],
  ["--danger", "خطا و لغو", "#b13f38"],
  ["--danger-soft", "زمینه خطا", "#fdf0ed"],
];
const sections = [
  ["principles", "روش استفاده"],
  ["colors", "رنگ‌ها"],
  ["type", "فونت و متن"],
  ["space", "فاصله و فرم"],
  ["buttons", "دکمه‌ها"],
  ["inputs", "ورودی‌ها"],
  ["pickers", "تقویم و ساعت"],
  ["cards", "کارت و نشان"],
  ["feedback", "حالت‌های صفحه"],
  ["icons", "آیکون‌ها"],
  ["responsive", "موبایل و دسترس‌پذیری"],
];
const icons: IconName[] = [
  "arrow",
  "chevron",
  "calendar",
  "clock",
  "users",
  "pin",
  "search",
  "check",
  "wifi",
  "coffee",
  "monitor",
  "spark",
  "grid",
  "menu",
  "close",
  "shield",
  "leaf",
  "briefcase",
  "plus",
  "minus",
  "mail",
];
function Code({ children }: { children: string }) {
  return (
    <pre className={styles.code}>
      <code>{children}</code>
    </pre>
  );
}

export default function DesignSystemPage() {
  return (
    <Container className={styles.guide}>
      <header className={styles.header}>
        <span className={styles.version}>
          <Icon name="grid" size={16} />
          KAVIN DESIGN SYSTEM · v1.0
        </span>
        <h1>یک زبان مشترک، برای ادامه‌ی کاوین.</h1>
        <p>
          مرجع رنگ‌ها، اجزا و رفتارهای همین نسخه. نمونه‌ها از کامپوننت‌های واقعی
          پروژه استفاده می‌کنند؛ برای ساخت صفحه‌ی بعدی از همین‌جا شروع کن.
        </p>
      </header>
      <div className={styles.layout}>
        <nav className={styles.navigation} aria-label="بخش‌های دیزاین‌سیستم">
          {sections.map(([id, title]) => (
            <a key={id} href={`#ds-${id}`}>
              {title}
            </a>
          ))}
          <small>
            مرجع کد: app/globals.css
            <br />
            اجزای مشترک: components/ui
          </small>
        </nav>
        <div className={styles.content}>
          <section className={styles.section} id="ds-principles">
            <h2>از کجا شروع کنم؟</h2>
            <p className={styles.description}>
              کاوین یک رابط روشن، آرام و فارسی دارد: زمینه‌ی نزدیک به سفید، سبز
              برای کار اصلی، فضای خالی کافی و جزئیات کم. هدف این است که انتخاب
              فضا و رزرو راحت دیده شوند.
            </p>
            <div className={styles.note}>
              اول کامپوننت موجود را استفاده کن. اگر الگو تکرار می‌شود، خود همان
              کامپوننت را توسعه بده. برای تغییر کلی ظاهر، tokenها را در{" "}
              <bdi>globals.css</bdi> تغییر بده؛ رنگ را داخل هر صفحه جدا ننویس.
            </div>
            <Code>
              {
                'import Button from "@/components/ui/Button";\nimport Input from "@/components/ui/Input";\nimport Card from "@/components/ui/Card";'
              }
            </Code>
          </section>
          <section className={styles.section} id="ds-colors">
            <h2>رنگ‌ها</h2>
            <p className={styles.description}>
              نمونه‌رنگ‌ها مستقیماً از CSS variableهای پروژه می‌آیند. کدهای رنگ
              زیر، مقادیر نسخه ۱ هستند؛ منبع نهایی همیشه ابتدای globals.css است.
            </p>
            <div className={styles.colors}>
              {colors.map(([token, label, hex]) => (
                <div className={styles.swatch} key={token}>
                  <div
                    className={styles.swatchColor}
                    style={{ background: `var(${token})` }}
                  />
                  <div className={styles.swatchInfo}>
                    <strong>{label}</strong>
                    <code>{token}</code>
                    <div className={styles.hex}>{hex}</div>
                  </div>
                </div>
              ))}
            </div>
            <Code>
              {
                ":root {\n  --primary: #235745;\n  --primary-hover: #173e30;\n  --primary-soft: #edf3e9;\n}\n\n.my-component {\n  color: var(--foreground);\n  background: var(--surface);\n  border: 1px solid var(--border);\n}"
              }
            </Code>
          </section>
          <section className={styles.section} id="ds-type">
            <h2>فونت و متن</h2>
            <p className={styles.description}>
              فونت محلی کلمه با متغیر <bdi>--font-kalameh</bdi> در layout تعریف
              شده است. وزن متن معمولی ۴۰۰، عنوان و تأکید ۶۰۰ یا ۷۰۰ است. یک
              عنوان اصلی در هر صفحه داشته باش.
            </p>
            <div className={styles.typography}>
              <div>
                <span className={styles.exampleLabel}>
                  عنوان نمایشی · نمونه ۵۲px · وزن ۷۰۰
                </span>
                <div className={styles.typeDisplay}>
                  اینجا، جای بهتر کار کردنه.
                </div>
              </div>
              <div>
                <span className={styles.exampleLabel}>
                  عنوان صفحه · ۳۸px دسکتاپ، ۳۰px موبایل
                </span>
                <div className={styles.typePage}>یک فضا، هزار امکان.</div>
              </div>
              <div>
                <span className={styles.exampleLabel}>
                  عنوان بخش · ۳۱px دسکتاپ، ۲۶px موبایل
                </span>
                <div className={styles.typeSection}>امروز کجا کار می‌کنی؟</div>
              </div>
              <div>
                <span className={styles.exampleLabel}>عنوان کارت · ۲۱px</span>
                <div className={styles.typeCard}>اتاق جلسه آفتاب</div>
              </div>
              <div>
                <span className={styles.exampleLabel}>
                  متن پایه · ۱۵px · فاصله خطوط ۱٫۸
                </span>
                <p className={styles.typeBody}>
                  یک میز برای تمرکز، یک اتاق برای هم‌فکری؛ فضای مناسب خودت را
                  پیدا کن.
                </p>
              </div>
              <div>
                <span className={styles.exampleLabel}>
                  برچسب فیلد · ۱۲px · وزن ۶۰۰
                </span>
                <span className={styles.typeLabel}>تاریخ حضورت</span>
              </div>
            </div>
            <div className={styles.note}>
              در پیام‌ها مستقیم و دوستانه بنویس: «یک تاریخ معتبر انتخاب کنید».
              خطا باید راه اصلاح را بگوید. متن فنی و عبارت‌های مربوط به API را
              وارد مسیر رزرو کاربر نکن.
            </div>
          </section>
          <section className={styles.section} id="ds-space">
            <h2>فاصله، گردی و سایه</h2>
            <p className={styles.description}>
              واحد پایه‌ی فاصله ۴px است. برای اجزای جدید از مقیاس زیر شروع کن؛
              اندازه‌های ویژه‌ی تصاویر و چیدمان فعلی استثنا دارند. این مقیاس
              تمام فاصله‌های فعلی را به‌صورت خودکار تغییر نمی‌دهد.
            </p>
            <div className={styles.spacing}>
              {[4, 8, 12, 16, 24, 32, 48, 64].map((value) => (
                <div className={styles.spaceRow} key={value}>
                  <span>{value}px</span>
                  <div
                    className={styles.spaceBar}
                    style={{ width: value * 3 }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.shapes}>
              {[
                ["--radius-sm", "کنترل و دکمه", "9px"],
                ["--radius", "کارت معمولی", "16px"],
                ["--radius-lg", "بخش و فرم رزرو", "24px"],
              ].map(([token, title, value]) => (
                <div
                  className={styles.shape}
                  key={token}
                  style={{ borderRadius: `var(${token})` }}
                >
                  {title}
                  <code>
                    {token}
                    <br />
                    {value}
                  </code>
                </div>
              ))}
            </div>
            <div className={styles.twoColumns}>
              <div
                className={styles.shape}
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                }}
              >
                سایه‌ی آرام کارت<code>--shadow</code>
              </div>
              <div
                className={styles.shape}
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-popover)",
                }}
              >
                سایه‌ی پنجره انتخابگر<code>--shadow-popover</code>
              </div>
            </div>
            <p className={styles.description} style={{ marginTop: 22 }}>
              ارتفاع پایه‌ی کنترل ۴۸px و بیشترین عرض محتوا ۱۲۰۰px است. برای
              یکدستی عرض صفحات از Container استفاده کن.
            </p>
          </section>
          <section className={styles.section} id="ds-buttons">
            <h2>دکمه‌ها</h2>
            <p className={styles.description}>
              Primary برای کار اصلی، Secondary برای کار فرعی، Ghost برای عمل
              کم‌تأکید و Danger برای لغو. در یک بخش، چند دکمه‌ی اصلی هم‌وزن
              نگذار.
            </p>
            <ButtonExamples />
            <Code>
              {
                '<Button type="submit">ثبت رزرو</Button>\n<Button variant="secondary">مشاهده جزئیات</Button>\n<Button variant="ghost">انصراف</Button>\n<Button variant="danger">لغو رزرو</Button>\n<Button disabled>در حال ثبت...</Button>'
              }
            </Code>
            <p className={styles.description}>
              حالت loading در API دکمه یک prop جدا نیست؛ متن را عوض کن و
              disabled بده. برای رفتن به صفحه‌ی دیگر از Link با کلاس‌های button
              استفاده کن. نوع light فقط یک کلاس CSS برای زمینه‌ی تیره است، نه
              variant کامپوننت Button.
            </p>
          </section>
          <section className={styles.section} id="ds-inputs">
            <h2>ورودی‌ها</h2>
            <p className={styles.description}>
              Label همیشه بیرون از ورودی می‌ماند؛ placeholder جای label نیست. هر
              فیلد id یکتا دارد و پیام خطا به همان ورودی متصل می‌شود. فرم سمت چپ
              را خالی ارسال کن تا حالت خطا را ببینی.
            </p>
            <FieldExamples />
            <Code>
              {
                '<Input\n  id="email"\n  label="ایمیل"\n  type="email"\n  error={errors.email?.message}\n  {...register("email")}\n/>'
              }
            </Code>
          </section>
          <section className={styles.section} id="ds-pickers">
            <h2>تقویم و ساعت</h2>
            <p className={styles.description}>
              تقویم شمسی نمایش داده می‌شود، ولی value میلادی و به شکل YYYY-MM-DD
              است. ساعت به شکل HH:mm نگهداری می‌شود. هر دو از Picker مشترک
              استفاده می‌کنند تا کادر، فوکوس و رفتار بستن یکسان باشد.
            </p>
            <PickerExamples />
            <Code>
              {
                'const [date, setDate] = useState("");\nconst [start, setStart] = useState("");\n\n<DatePicker\n  id="date" label="تاریخ حضور"\n  value={date} onChange={setDate}\n/>\n<TimePicker\n  id="start" label="از ساعت"\n  value={start} onChange={setStart}\n  disabledTimes={["08:00", "08:30"]}\n/>'
              }
            </Code>
            <div className={styles.note}>
              انتخابگر فقط رابط است. ظرفیت، گذشته بودن ساعت و تداخل در schema و
              منطق رزرو بررسی می‌شوند. برای تغییر ساعت کاری، TIME_SLOTS و schema
              را با هم تغییر بده.
            </div>
          </section>
          <section className={styles.section} id="ds-cards">
            <h2>کارت و نشان</h2>
            <p className={styles.description}>
              Card قاب عمومی است؛ برای نمایش فضا از SpaceCard استفاده کن تا
              تصویر، قیمت و لینک در همه صفحه‌ها هماهنگ بمانند.
            </p>
            <div className={styles.twoColumns}>
              <SpaceCard space={spaces[0]} />
              <Card>
                <h3>نمونه‌ی Card عمومی</h3>
                <p className={styles.description}>
                  برای اطلاعات مرتبط، یک قاب ساده با کادر ملایم کافی است.
                </p>
                <div className={styles.examples}>
                  <Badge>پیش‌فرض</Badge>
                  <Badge variant="info">اطلاعات</Badge>
                  <Badge variant="success">تأیید شده</Badge>
                </div>
                <p className={styles.description}>
                  در نسخه فعلی سه variant نشان، رنگ پایه یکسان دارند. برای
                  وضعیت‌های محصول، متن واضح را حفظ کن؛ حالت لغوشده در صفحه
                  رزروها از booking-status cancelled استفاده می‌کند.
                </p>
                <Link href="/spaces" className="text-link">
                  دیدن فضاها
                  <Icon name="arrow" size={18} />
                </Link>
              </Card>
            </div>
            <Code>
              {
                '<Card>محتوای مرتبط</Card>\n<SpaceCard space={space} />\n<Badge variant="success">تأیید شده</Badge>'
              }
            </Code>
          </section>
          <section className={styles.section} id="ds-feedback">
            <h2>خالی، خطا و بارگذاری</h2>
            <p className={styles.description}>
              هر صفحه‌ی داده‌محور، علاوه بر نتیجه‌ی موفق، به حالت خالی، بارگذاری
              و خطای قابل بازیابی نیاز دارد. خطا فقط رنگ قرمز نیست؛ دلیل و قدم
              بعدی را بگو.
            </p>
            <div className={styles.feedback}>
              <div className="error-notice">
                ذخیره رزرو ممکن نشد. فضای ذخیره‌سازی مرورگر را بررسی کنید و
                دوباره تلاش کنید.
              </div>
              <div className="availability-note">
                <Icon name="check" size={15} />
                برای این روز هنوز رزروی ثبت نشده.
              </div>
              <div
                className={`skeleton ${styles.loading}`}
                aria-label="نمونه اسکلت بارگذاری"
              />
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon name="search" size={28} />
                </span>
                <h3>این بار فضایی پیدا نشد</h3>
                <p>نام کوتاه‌تری جستجو کن یا فیلترها را تغییر بده.</p>
                <Link href="/spaces" className="button button-secondary">
                  نمایش همه فضاها
                </Link>
              </div>
            </div>
          </section>
          <section className={styles.section} id="ds-icons">
            <h2>آیکون‌ها</h2>
            <p className={styles.description}>
              آیکون‌های خطی، معمولاً ۱۶ تا ۲۰px. برای یک کاربرد از یک آیکون ثابت
              استفاده کن. دکمه‌ی فقط‌آیکون باید aria-label داشته باشد؛ Icon خودش
              تزئینی است.
            </p>
            <div className={styles.icons}>
              {icons.map((name) => (
                <div key={name} className={styles.iconTile}>
                  <Icon name={name} size={22} />
                  <code>{name}</code>
                </div>
              ))}
            </div>
            <Code>
              {
                '<Icon name="calendar" size={20} />\n<button type="button" aria-label="بستن" className="icon-button">\n  <Icon name="close" size={17} />\n</button>'
              }
            </Code>
          </section>
          <section className={styles.section} id="ds-responsive">
            <h2>موبایل و دسترس‌پذیری</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>بازه</th>
                    <th>رفتار فعلی</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>تا ۳۶۰px</td>
                    <td>
                      فاصله‌های فشرده‌تر، کنترل‌های تقویم کوچک‌تر و حفظ عرض صفحه
                    </td>
                  </tr>
                  <tr>
                    <td>تا ۶۰۰px</td>
                    <td>
                      منوی موبایل، کارت تک‌ستونه، حاشیه ۱۸px؛ زیر ۳۶۰px، ۱۴px
                    </td>
                  </tr>
                  <tr>
                    <td>تا ۸۰۰px</td>
                    <td>صفحه جزئیات تک‌ستونه، فرم رزرو زیر محتوای فضا</td>
                  </tr>
                  <tr>
                    <td>تا ۱۰۵۰px</td>
                    <td>حاشیه ۲۴px و چیدمان فشرده‌تر</td>
                  </tr>
                  <tr>
                    <td>دسکتاپ</td>
                    <td>
                      حاشیه ۴۰px، بیشترین عرض ۱۲۰۰px؛ فضای hero در ۱۵۰۰px به
                      بالا بازتر می‌شود
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className={styles.list}>
              <li>
                صفحه RTL است. ایمیل، شناسه و قطعه کد را با{" "}
                <code>dir=&quot;ltr&quot;</code> یا bdi نمایش بده.
              </li>
              <li>
                با Tab تمام کنترل‌ها قابل دسترسی باشند؛ کادر focus را حذف نکن.
              </li>
              <li>تقویم و ساعت با Escape بسته شوند و فوکوس به دکمه برگردد.</li>
              <li>
                رنگ تنها علامت خطا یا وضعیت نباشد؛ متن و آیکون مناسب هم داشته
                باش.
              </li>
              <li>
                رنگ muted برای متن فرعی است؛ خوانایی متن‌های ریز را جدا بررسی
                کن. این راهنما گزارش تأیید کامل WCAG نیست.
              </li>
              <li>
                در ۳۲۰، ۳۹۰، ۷۶۸، ۱۰۲۴ و ۱۴۴۰px تست کن؛ بعد روی گوشی واقعی هم
                ببین.
              </li>
            </ul>
            <div className={styles.note}>
              برای ساخت صفحه‌ی تازه: Container → PageHeader → اجزای مشترک →
              حالت‌های loading/error/empty → بررسی موبایل و کیبورد. اگر الگوی
              تازه‌ای ساختی، همین راهنما را هم به‌روز کن.
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
