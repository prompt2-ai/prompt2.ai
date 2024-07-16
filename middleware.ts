//NEXTAUTH 
import NextAuth from "next-auth"
import authConfig from "@/auth.config"
 
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|welcome|documentation|subscriptions|legal|_next/static|_next/image|.*\\.png|.*\\.svg|loader.html|logout$).*)', '/'],
};
