import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const kalameh = localFont({
  src: [
    { path: "./fonts/KalamehWeb-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/KalamehWeb-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "./fonts/KalamehWeb-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/KalamehWeb-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KalamehWeb-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/KalamehWeb-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/KalamehWeb-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/KalamehWeb-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/KalamehWeb-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-kalameh",
});

export const metadata: Metadata = {
  title: "کاوین | پلتفرم رزرو فضای کار اشتراکی",
  description: "پلتفرمی برای رزرو فضاهای کار اشتراکی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`${kalameh.variable} h-full antialiased`}>
     <body className="min-h-full font-sans">
  <Navbar />
  {children}
   <Footer />
</body>
    </html>
  );
}