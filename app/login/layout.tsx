import Layout from "@/components/custom/O/O-layout";

export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}