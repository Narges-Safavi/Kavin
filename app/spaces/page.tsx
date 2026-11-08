import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SpacesExplorer from "@/components/SpacesExplorer";
import { getSpaces } from "@/lib/spaces";

// فضاها از API می‌آیند، پس صفحه هر بار تازه ساخته می‌شود.
export const dynamic = "force-dynamic";

export default async function SpacesPage() {
  const spaces = await getSpaces();
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
        <SpacesExplorer spaces={spaces} />
      </Container>
    </>
  );
}