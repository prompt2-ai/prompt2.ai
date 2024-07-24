//NEXTAUTH 
import NextAuth from "next-auth"
import authConfig from "@/auth.config"
 
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|login|O|about|documentation|legal|_next/static|_next/image|.*\\.png|.*\\.svg|.*\\.mp4|loader.html|logout$).*)', '/'],
};
