'use server';
import NextAuth from 'next-auth';
import { authConfig } from "@/auth.config"

export const getSession=async ()=>{
  const auth = NextAuth(authConfig).auth;
  return auth().then((session) => {
    //console.log('session on getSession', session);
  return session;
  });
}