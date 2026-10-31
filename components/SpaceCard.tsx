import Link from "next/link";
import Image from "next/image";
import { type Space, spaceTypeLabels } from "@/lib/data";
import { formatNumber } from "@/lib/date";
import Icon from "./ui/Icon";
export default function SpaceCard({ space }: { space: Space }) {
  return (
    <article className="space-card">
      <Link
        href={`/spaces/${space.id}`}
        className="space-image-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={space.image}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="photo-badge">{spaceTypeLabels[space.type]}</span>
      </Link>
      <div className="space-card-body">
        <div className="space-card-tag">
          <i />
          {space.tag}
        </div>
        <h3>
          <Link href={`/spaces/${space.id}`}>{space.name}</Link>
        </h3>
        <p className="space-location">
          <Icon name="pin" size={15} />
          {space.location}
        </p>
        <div className="space-facts">
          <span>
            <Icon name="users" size={16} />
            تا {formatNumber(space.capacity)} نفر
          </span>
          <span>
            <Icon name="wifi" size={16} />
            اینترنت پرسرعت
          </span>
          <span>
            <Icon name="coffee" size={16} />
            قهوه
          </span>
        </div>
        <div className="space-card-bottom">
          <div>
            <strong>{formatNumber(space.price)}</strong>
            <span>
              {" "}
              تومان <small>/ ساعت</small>
            </span>
          </div>
          <Link
            className="circle-link"
            href={`/spaces/${space.id}`}
            aria-label={`مشاهده ${space.name}`}
          >
            <Icon name="arrow" size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
