import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function Home() {
  return (
    <Container className="py-10">
      <PageHeader
        title="فضاهای کاری"
        description="فضای مناسب کار و جلسات خود را پیدا کنید."
      />

      <div className="flex flex-col gap-4">
        <Input id="name" label="نام" placeholder="نام خود را بنویسید" />
        <Input
          id="guests"
          label="تعداد نفرات"
          type="number"
          error="تعداد نفرات باید عدد صحیح باشد."
        />
        <Button>ثبت</Button>

        <Card>
          <Badge variant="info">اتاق جلسه</Badge>
          <p className="mt-2">این یک کارت نمونه است.</p>
        </Card>
      </div>
    </Container>
  );
}