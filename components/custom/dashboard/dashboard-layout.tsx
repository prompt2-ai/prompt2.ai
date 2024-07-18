"use client";

import { cn } from "@/lib/utils";
import { useStateStore,leftSidebarSwitch } from "@/lib/hooks";
import  Footer  from "@/components/custom/footer";
import Menu from "@/components/custom/dashboard/top-menu";
import { Sidebar } from "@/components/custom/dashboard/sidebar";


export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStateStore(leftSidebarSwitch, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      > 
        <Menu />
        <div className="p-4">
        {children}
      </div>
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      >
        <Footer />
      </footer>
    </>
  );
}