import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Space, spaceTypeLabels } from "@/lib/data";

type SpaceCardProps = {
  space: Space;
};

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <Card className="h-full transition hover:shadow-md">
        <Badge variant="info">{spaceTypeLabels[space.type]}</Badge>
        <h2 className="mt-3 text-lg font-semibold text-zinc-900">
          {space.name}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{space.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>ظرفیت: {space.capacity} نفر</span>
          <span className="font-medium">
            {space.price.toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </Card>
    </Link>
  );
}