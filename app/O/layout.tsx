import Layout from "@/components/custom/O/O-layout";

export default function OLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}