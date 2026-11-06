import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="رمزت را فراموش کرده‌ای؟"
        description="ایمیلت را وارد کن تا لینک بازیابی برایت ارسال شود."
      />
      <ForgotPasswordForm />
      <p>
        <Link href="/login">بازگشت به ورود</Link>
      </p>
    </Container>
  );
}