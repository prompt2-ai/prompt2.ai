import { signOut } from 'next-auth/react';
import NextAuth from 'next-auth';
import { authConfig } from "@/auth.config"


export  const logout = async () => {
   return await signOut(
        {
            redirect: true,
            callbackUrl: '/',
        }
    );  
  }



