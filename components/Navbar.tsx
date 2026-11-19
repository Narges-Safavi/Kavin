"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open)
      navigation.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [open]);
  // undefined: هنوز نمی‌دانیم، null: مهمان، AuthUser: وارد شده
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [retry, setRetry] = useState(0);
  const [check, setCheck] = useState<{ key: string; failed: boolean } | null>(
    null,
  );
  const [leaving, setLeaving] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const checkKey = `${pathname}:${retry}`;
  const checking = check?.key !== checkKey;
  const failed = !checking && check.failed;

  // با هر تغییر صفحه (مثلاً بعد از ورود) دوباره می‌پرسیم کاربر کیست.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((current) => {
        if (!cancelled) {
          setUser(current);
          setCheck({ key: checkKey, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) setCheck({ key: checkKey, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [checkKey]);

  async function handleLogout() {
    setLeaving(true);
    setLogoutError(false);
    try {
      await logout();
    } catch {
      setLogoutError(true);
      setLeaving(false);
      return;
    }
    setUser(null);
    setLeaving(false);
    setOpen(false);
    router.push("/");
  }

  const navLinks =
    !checking && !failed && user === null ? [...links, ...guestLinks] : links;

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
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
          ref={navigation}
          id="main-navigation"
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
          <Link
            className="button button-secondary nav-bookings"
            href="/bookings"
          >
            <Icon name="calendar" size={17} />
            رزروهای من
          </Link>
          <button
            type="button"
            className="icon-button mobile-menu"
            ref={menuButton}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
        <div className="nav-account" aria-label="وضعیت حساب">
          {user && (
            <span className="nav-user" dir="auto">
              {user.username}
            </span>
          )}
          {checking && <span role="status">در حال بررسی حساب…</span>}
          {failed && (
            <>
              <span role="alert">وضعیت حساب دریافت نشد.</span>
              <button
                type="button"
                className="link-button"
                onClick={() => setRetry((value) => value + 1)}
              >
                تلاش دوباره
              </button>
            </>
          )}
          {user && (
            <button
              type="button"
              className="button button-secondary"
              disabled={leaving || checking}
              onClick={handleLogout}
            >
              {leaving ? "در حال خروج…" : "خروج"}
            </button>
          )}
          {logoutError && (
            <span role="alert">خروج انجام نشد. دوباره تلاش کنید.</span>
          )}
        </div>
      </div>
    </header>
  );
}
