"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./ui/Icon";
const links = [
  { href: "/", label: "خانه" },
  { href: "/spaces", label: "فضاهای کاری" },
  { href: "/about", label: "داستان کاوین" },
  { href: "/faq", label: "سؤال‌های شما" },
];
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
          {links.map((link) => (
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
