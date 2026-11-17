import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SpacesExplorer from "@/components/SpacesExplorer";
import { getSpaces } from "@/lib/spaces";
import { readSpaceFilters } from "@/lib/space-filters";

// فضاها از API می‌آیند، پس صفحه هر بار تازه ساخته می‌شود.
export const dynamic = "force-dynamic";

export default async function SpacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const filters = readSpaceFilters(params);
  const spaces = await getSpaces(filters);
  return (
    <>
      <div className="page-top">
        <Container>
          <PageHeader
            title="یک فضا، هزار امکان."
            description="برای تمرکز، هم‌فکری یا کنار هم بودن؛ فضای مناسب خودت را انتخاب کن."
          />
        </Container>
      </div>
      <Container className="section explorer-section">
        <SpacesExplorer spaces={spaces} filters={filters} />
      </Container>
    </>
  );
}
