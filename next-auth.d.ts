// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

interface CustomUser {
  stripeCustomerId?: string;
  apiKey?: string;
  plan?: string;
  role?: string;
  id?: string;
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: CustomUser & DefaultSession["user"]
  }
  interface User extends CustomUser { }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends CustomUser { }
}