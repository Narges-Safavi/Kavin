import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SpaceCard from "@/components/SpaceCard";
import { spaces } from "@/lib/data";

export default function SpacesPage() {
  return (
    <Container className="py-10">
      <PageHeader
        title="فضاهای کاری"
        description="فضای مناسب کار و جلسات خود را پیدا کنید."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {spaces.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </Container>
  );
}