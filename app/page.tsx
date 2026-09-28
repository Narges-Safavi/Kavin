import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <Input id="name" label="نام" placeholder="نام خود را بنویسید" />
      <Input
        id="guests"
        label="تعداد نفرات"
        type="number"
        error="تعداد نفرات باید عدد صحیح باشد."
      />
      <Button>ثبت</Button>
    </main>
  );
}