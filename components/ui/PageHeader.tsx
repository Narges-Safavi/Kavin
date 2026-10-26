export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="page-header">
      <span className="eyebrow">فضایی برای بهتر کار کردن</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
