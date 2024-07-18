
export default function LegalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="p-8 lg:container">{children}</div>;
}