import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSession } from "@/app/actions";
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/custom/authProvider";
import CookieBanner from "@/components/custom/cookieConsent";
import "./globals.css";
import './theme.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "prompt to BPMN 2.0 workflow",
  description: "Streamline Your BPMN 2.0 Workflows with AI",
  robots: { //remove this line to allow indexing
    index: true,
    follow: true  
  },
  };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession(); 
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
      <AuthProvider>
          {children}
          <CookieBanner />
      </AuthProvider>
       </ThemeProvider>
        </body>
    </html>
  );
}
