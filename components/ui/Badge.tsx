export default function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "info" | "success";
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
