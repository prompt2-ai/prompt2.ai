//NEXTAUTH
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from "next-auth/providers/github"

import bcrypt from 'bcryptjs';
import { z } from 'zod';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};


function getUser(email: string): User | undefined {
  try {
    if (email !== 'sl45sms@yahoo.gr') return undefined;
    const user = {
      id: '1',
      name: 'Test User',
      email: 'sl45sms@yahoo.gr',
      //bcrypt string "test" as password
      password: '$2a$12$66G36t3Xbch7j1XgxD/L/OlfK.tnfmI7EDT9M6kQ7cXxuYdPiFhXW',//https://bcrypt-generator.com/
    }
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}


export const authConfig = {
  providers: [
    GitHub,
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = getUser(email);
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/welcome', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;