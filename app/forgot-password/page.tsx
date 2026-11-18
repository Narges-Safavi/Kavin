import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export default function ForgotPasswordPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="رمزت را فراموش کرده‌ای؟"
        description="بازیابی رمز عبور فعلاً در دسترس نیست."
      />
      <p>
        <Link href="/login">بازگشت به ورود</Link>
      </p>
    </Container>
  );
}
