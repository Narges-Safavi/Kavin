import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <Container className="content-page">
      <PageHeader
        title="حساب کاوین بساز."
        description="با چند اطلاعات ساده، رزروهایت را یک‌جا ببین."
      />
      <SignupForm />
      <p>
        حساب داری؟ <Link href="/login">ورود</Link>
      </p>
    </Container>
  );
}