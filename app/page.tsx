import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export default function Home() {
  return (
    <Container className="py-10">
      <PageHeader
        title="فضاهای کاری"
        description="فضای مناسب کار و جلسات خود را پیدا کنید."
      />
      <Button>مشاهده فضاها</Button>
    </Container>
  );
}