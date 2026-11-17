import type { SpaceType } from "./data";

export type SpaceFilters = {
  search: string;
  type: SpaceType | "all";
  capacity: number;
  sort: "recommended" | "low" | "high";
};

export function readSpaceFilters(params: URLSearchParams): SpaceFilters {
  const type = params.get("type");
  const capacity = Number(params.get("minCapacity"));
  const ordering = params.get("ordering");
  return {
    search: (params.get("search") ?? "")
      .trim()
      .slice(0, 150)
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, " "),
    type:
      type === "meeting-room" ||
      type === "shared-desk" ||
      type === "private-office"
        ? type
        : "all",
    capacity:
      Number.isInteger(capacity) && capacity >= 1 && capacity <= 32767
        ? capacity
        : 0,
    sort:
      ordering === "price"
        ? "low"
        : ordering === "-price"
          ? "high"
          : "recommended",
  };
}

export function spaceFilterQuery(filters: SpaceFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.capacity) params.set("minCapacity", String(filters.capacity));
  if (filters.sort !== "recommended")
    params.set("ordering", filters.sort === "low" ? "price" : "-price");
  return params.toString();
}
