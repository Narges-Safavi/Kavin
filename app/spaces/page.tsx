import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SpacesExplorer from "@/components/SpacesExplorer";
export default function SpacesPage() {
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
        <SpacesExplorer />
      </Container>
    </>
  );
}
