import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="به کاوین خوش آمدی."
        description="برای دیدن رزروهایت وارد حساب کاربری شو."
      />
      <LoginForm />
      <p>
        <Link href="/forgot-password">رمزت را فراموش کرده‌ای؟</Link>
      </p>
      <p>
        حساب نداری؟ <Link href="/signup">ثبت‌نام</Link>
      </p>
    </Container>
  );
}