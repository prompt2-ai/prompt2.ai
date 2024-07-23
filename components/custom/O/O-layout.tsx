"use client";

import Footer  from "@/components/custom/footer";
import Menu from "@/components/custom/O/menu";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return <>
   
      <main
        className="min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900"
      >       
      {process.env.NEXT_PUBLIC_WEBSITE_URL && process.env.NEXT_PUBLIC_WEBSITE_URL.includes("dev") && (
      <div className="shadow-2xl inset-y-0 min-h-7 sticky text-center bg-red-500 z-40"><strong>WARNING! this site is under heavy development.</strong></div>)}
      <div className="sticky top-0 z-50 border-b border-border/40 bg-black backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Menu />
      </div> 
      <div className="p-4">
        {children}
      </div>
      </main>
      <footer
        className="transition-[margin-left] ease-in-out duration-300 lg:lg:ml-[0px]"
      >
        <Footer />
      </footer>
      </>
}