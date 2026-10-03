import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export default function AboutPage() {
  return (
    <Container className="py-10">
      <PageHeader
        title="درباره ما"
        description="کاوین پلتفرمی برای رزرو فضاهای کار اشتراکی است."
      />
      <p className="text-zinc-700">
        هدف ما این است که پیدا کردن و رزرو فضای کار مناسب را ساده و سریع کنیم.
      </p>
    </Container>
  );
}