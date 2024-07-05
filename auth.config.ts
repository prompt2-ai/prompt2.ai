//NEXTAUTH
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

//import db  from './db/models/index.js';

//import Linkedin from "next-auth/providers/linkedin"
//import Resend from "next-auth/providers/resend"

import bcrypt from 'bcryptjs';
import { z } from 'zod';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

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
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub,
    Google,
    /* Uncomment to enable other providers
    Apple,
    Linkedin,
    Resend({
      from: "no-reply@prompt2.ai",
    }),
    */
    Credentials({
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
    
  ],
  callbacks: {
    session({session, user}){
      console.log('session callback', session, user);
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;