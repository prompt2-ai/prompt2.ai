import { signOut } from 'next-auth/react';

export  const logout = async () => {
   return await signOut(
        {
            redirect: true,
            callbackUrl: '/',
        }
    );  
  }



