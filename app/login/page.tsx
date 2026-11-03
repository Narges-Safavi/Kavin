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
    </Container>
  );
}