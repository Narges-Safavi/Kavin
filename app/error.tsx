"use client";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Container className="section">
      <div className="empty-state" role="alert">
        <h1>یک وقفه کوچک پیش آمد.</h1>
        <p>بارگذاری صفحه کامل نشد. یک بار دیگر امتحان کن.</p>
        <Button onClick={reset}>تلاش دوباره</Button>
      </div>
    </Container>
  );
}
