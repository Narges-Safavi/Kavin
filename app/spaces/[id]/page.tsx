import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import ReservationForm from "@/components/ReservationForm";
import { spaces, spaceTypeLabels } from "@/lib/data";

type SpaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpaceDetailPage({
  params,
}: SpaceDetailPageProps) {
  const { id } = await params;
  const space = spaces.find((s) => s.id === id);

  if (!space) {
    notFound();
  }

  return (
    <Container className="py-10 max-w-2xl">
      <Badge variant="info">{spaceTypeLabels[space.type]}</Badge>
      <h1 className="mt-3 mb-4 text-2xl font-bold">{space.name}</h1>
      <p className="mb-6 text-zinc-600">{space.description}</p>
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
        <span>ظرفیت: {space.capacity} نفر</span>
        <span className="font-medium">
          {space.price.toLocaleString("fa-IR")} تومان
        </span>
      </div>
      <ReservationForm capacity={space.capacity}/>
    </Container>
  );
}