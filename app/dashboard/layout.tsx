import Layout from "@/components/custom/dashboard/dashboard-layout";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}