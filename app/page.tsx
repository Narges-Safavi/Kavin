import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Button>دکمه اصلی</Button>
      <Button variant="secondary">دکمه ثانویه</Button>
      <Button disabled>غیرفعال</Button>
    </main>
  );
}