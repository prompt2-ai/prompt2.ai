"use client"; // This is a client-side component, use this directive to avoid SSR errors like "(0 , react__WEBPACK_IMPORTED_MODULE_0__.createContext) is not a function"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/custom/themeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const Menu = () => {

  const { data: session, status } = useSession();
  const [avatar, setAvatar] = useState("");
  const [avatarFallback, setAvatarFallback] = useState("");
  const [tokens, setTokens] = useState({
    paidTokens: 0,
    usedTokens: 0,
    availableTokens: 0
  });
  useEffect(() => {
    const run = async () => {
      const s = session;
      if (s === undefined || s === null) {
      } else {
        if (s.user.image === null || s.user.image === undefined || s.user.image === "") {
          const name = (s && s.user.name) ? s.user.name.split(" ") || "" : "";
          const nameLength = name.length;
          if (nameLength > 1)
        setAvatarFallback(name[0][0] + name[1][0]);
          else if (nameLength > 0)
        setAvatarFallback(name[0][0]);
          //keep JD for John Doe or Jane Doe
          else setAvatarFallback("JD");
        }
        setAvatar((s && s.user.image) ? s.user.image : "");
        //fetch tokens from /api/tokens that returns {"paidTokens":0,"usedTokens":0,"availableTokens":0}
        const fetchTokens = async () => {
          try {
        const res = await fetch("/api/tokens");
        const data = await res.json();
        setTokens(data);
          } catch (error) {
        console.error("Error fetching tokens", error);
          }
        };
        fetchTokens();
        const interval = setInterval(fetchTokens, 60000); // Refresh tokens every 1 minute
        return () => clearInterval(interval); // Clean up the interval when component unmounts
      }
    };
    run();
  }, [session,status]);

  return (
    <>
      <div className="w-full">
        {status=="authenticated" && (<>
          <header className="max-sm:mt-3 mt-2 p-2 sticky items-center gap-4 bg-background/20 h-[48px] px-4 md:px-6">
            <nav className="h-[48] text-lg font-medium flex flex-initial items-center gap-4 md:gap-5 md:text-sm lg:gap-6">
<div className="lg:hidden">          
  <DropdownMenu >
  <DropdownMenuTrigger>|||</DropdownMenuTrigger>
  <DropdownMenuContent className="m-5 lg:hidden">
    <DropdownMenuItem><Link href="/O">Home</Link></DropdownMenuItem>
    <DropdownMenuItem><Link href="/O/profile">Profile</Link></DropdownMenuItem>
    <DropdownMenuItem><Link href="/O/subscriptions">Subscription</Link></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
              
              <div className="hidden md:inline-block">
                Tokens: {tokens.availableTokens} / {tokens.paidTokens}
              </div>

              <Button
                onClick={() => signOut()}
                variant="outline" className="top-0 absolute right-16 h-[48px] gap-2">
                <Avatar>
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar><span>Sign Out</span>
              </Button>
              <div className="top-1 float-right absolute right-3"><ThemeToggle /></div>
            </nav>
          </header>
        </>)}
      </div>
    </>
  );
}

export default Menu;