import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSession } from "@/app/actions";
import Menu from "@/components/custom/menu";
import Footer from "@/components/custom/footer";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "prompt to workflow, form, and decision tables.",
  description: "be ready to prompt soon...",
  robots: { //remove this line to allow indexing
    index: false,
    follow: false  
  },
  };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession(); 
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="shadow-2xl inset-y-0 min-h-7 sticky text-center bg-red-500 z-40"><strong>WARNING! this site is under heavy development.</strong></div>
      <div className="flex sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Menu session={session}/></div>
      <main className="container isolate mx-auto px-4">
        
        <div className="flex flex-col min-h-screen p-8">
          {children}
        </div>
       </main>
       <Footer />
        </body>
    </html>
  );
}
