//NEXTAUTH
import type { NextAuthConfig } from 'next-auth';
//import Credentials from 'next-auth/providers/credentials';
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"

//import Linkedin from "next-auth/providers/linkedin"
//import Resend from "next-auth/providers/resend"
/*
import bcrypt from 'bcryptjs';
import { z } from 'zod';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};
*/
/*
function getUser(email: string): User | undefined {
  try {
      //use sequileze to get the user from DB on the table User where email=email
      const users = db.sequelize.models.users;
      const all = users.findAll();
      console.log('all users', all);
      const user = users.findOne({where: {email: email}});
      return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
*/
export const authConfig = {
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
     },
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub,
    Google,
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: ""+process.env.AUTH_APPLE_SECRET,
      checks: ["pkce"],
      token: {
        url: `https://appleid.apple.com/auth/token`,
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        params: {
          response_mode: "form_post",
          response_type: "code",//do not set to "code id_token" as it will not work
          scope: "name email"
        },},
        profile(profile) {
          return {
            id: profile.sub,
            name: "Person Doe",//profile.name.givenName + " " + profile.name.familyName, but apple does not return name...
            email: profile.email,
            image: "",
          }
        }
    }),

    /* Uncomment to enable other providers
    Linkedin,
    Resend({
      from: "no-reply@prompt2.ai",
    }),
    */
   /* Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = getUser(email);
          console.log('user returned form DB', user)
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    })
      */
    
  ],
  callbacks: {
    session({session, token}) {
      // Add user id to the session
      session.user.id = token.sub!;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      //console.log("ON AUTHORIZED CALLBACK", auth, nextUrl);
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      const isOnSubscription = nextUrl.pathname.startsWith('/O/');
      if (isOnSubscription) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      //or redirect to dashboard
      return Response.redirect(new URL('/dashboard', nextUrl));
    },
  },
} satisfies NextAuthConfig;

export default authConfig;