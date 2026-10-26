import Link from "next/link";
import Icon from "./ui/Icon";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link className="footer-brand" href="/">
            کاوین<span>جایی برای فکرهای تازه.</span>
          </Link>
          <p>فضای تو، برای کارهایی که دوست داری.</p>
        </div>
        <div className="footer-links">
          <Link href="/spaces">فضاهای کاری</Link>
          <Link href="/about">درباره کاوین</Link>
          <Link href="/contact">تماس با ما</Link>
          <Link href="/faq">سؤالات متداول</Link>
        </div>
        <span className="footer-note">
          <Icon name="leaf" />
          اینجا، ایده‌ها جا برای رشد دارند.
        </span>
      </div>
      <div className="container footer-bottom">
        <span>کاوین · پروژه آموزشی رزرو فضای کار</span>
        <span>با فکر، برای بهتر کار کردن</span>
      </div>
    </footer>
  );
}
