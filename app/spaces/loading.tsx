import Container from "@/components/ui/Container";
export default function Loading() {
  return (
    <Container className="section">
      <p role="status" className="eyebrow">
        در حال آماده‌کردن فضاها...
      </p>
      <div className="spaces-grid home-spaces" style={{ marginTop: 24 }}>
        {[1, 2, 3].map((id) => (
          <div key={id} className="skeleton" />
        ))}
      </div>
    </Container>
  );
}
