"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./ui/Icon";
import { fetchCurrentUser, logout, type AuthUser } from "@/lib/auth";

const links = [
  { href: "/", label: "خانه" },
  { href: "/spaces", label: "فضاهای کاری" },
  { href: "/about", label: "داستان کاوین" },
  { href: "/faq", label: "سؤال‌های شما" },
];

const guestLinks = [
  { href: "/login", label: "ورود" },
  { href: "/signup", label: "ثبت‌نام" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // undefined: هنوز نمی‌دانیم، null: مهمان، AuthUser: وارد شده
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  // با هر تغییر صفحه (مثلاً بعد از ورود) دوباره می‌پرسیم کاربر کیست.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // اگر خطا شد، در پرسش بعدی از سرور وضعیت واقعی دوباره معلوم می‌شود.
    }
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  const navLinks = user === null ? [...links, ...guestLinks] : links;

  return (
    <header className="site-header">
      <div className="container nav-bar">
        <Link className="brand" href="/" aria-label="کاوین، صفحه اصلی">
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          <span>
            کاوین<small>KAVIN SPACE</small>
          </span>
        </Link>
        <nav
          aria-label="ناوبری اصلی"
          className={`nav-links ${open ? "is-open" : ""}`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                pathname === link.href ||
                (link.href === "/spaces" && pathname.startsWith("/spaces/"))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {user && (
            <span className="nav-user" dir="auto">
              {user.username}
            </span>
          )}
          <Link
            className="button button-secondary nav-bookings"
            href="/bookings"
          >
            <Icon name="calendar" size={17} />
            رزروهای من
          </Link>
          {user && (
            <button
              type="button"
              className="button button-secondary"
              onClick={handleLogout}
            >
              خروج
            </button>
          )}
          <button
            type="button"
            className="icon-button mobile-menu"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}