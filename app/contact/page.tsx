import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export default function ContactPage() {
  return (
    <Container className="py-10">
      <PageHeader
        title="تماس با ما"
        description="برای هرگونه سؤال با ما در ارتباط باشید."
      />
      <p className="text-zinc-700">آدرس ایمیل: info@kavin.com</p>
    </Container>
  );
}