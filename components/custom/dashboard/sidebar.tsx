import Link from "next/link";
import Image from 'next/image';

import { cn } from "@/lib/utils";
import { useStateStore,leftSidebarSwitch } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/custom/dashboard/sidebar-menu";

import { SidebarToggle } from "@/components/custom/dashboard/sidebar-toggle";

export function Sidebar() {
  const sidebar = useStateStore(leftSidebarSwitch, (state) => state);
  
  if(!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/O" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="P2?" width={60} height={60} className="w-10 h-10 mr-1" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
             
            </h1>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}