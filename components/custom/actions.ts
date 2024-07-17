'use server';
import { signOut } from "@/auth";
import { redirect } from 'next/navigation'

export const logout = async () => {
   return await signOut(
        {
            redirect: true,
            redirectTo: '/',
        }
    );  
  }


export const navigate = (url: string)=> {
     redirect(url);
}
