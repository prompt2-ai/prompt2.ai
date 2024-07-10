"use client"; // This is a client-side component, use this directive to avoid SSR errors like "(0 , react__WEBPACK_IMPORTED_MODULE_0__.createContext) is not a function"
import React, { useState, useEffect } from "react";
import {Button} from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"

  import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
  } from "@/components/ui/menubar"
 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import Link from "next/link";
import Image from 'next/image';
import { cn } from "@/lib/utils"
import { logout } from "@/components/custom/actions";
import { Quote } from "lucide-react";

export const Menu = ({session}:any) => {

  const [isLogged, setIsLogged] = useState(false);
  const [onDashboard, setOnDashboard] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarFallback, setAvatarFallback] = useState("JD");
  useEffect(() => {
    const run = async () => {
      setOnDashboard(window.location.pathname.includes("/dashboard"));
      const s = session;
      console.log("SESSION",s);
      if (s === undefined || s === null) {
        setIsLogged(false);
      } else {
        setIsLogged(true);
        setAvatar(s.user.image);
      }
    };
    run();
  }, [session]);

  return (
      <>
        <div className="w-full">
          
          
         {onDashboard==false ? (
          <>
          <header className="max-sm:mt-3 p-2 sticky items-center gap-4 bg-background/20 px-4 md:px-6">
            <nav className="max-sm:hidden gap-6 text-lg font-medium md:flex md:flex-initial md:items-center md:gap-5 md:text-sm lg:gap-6">
              <Link
                href="/"
                className="items-center gap-2 text-lg font-semibold md:text-base"
              >
                <Image src="/logo.svg" alt="P2?" width={40} height={40} />
                <span className="sr-only">P2?</span>
              </Link>



              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-1 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/"
                            >
                              <Image
                                src="/logo.svg"
                                alt="P2?"
                                width={120}
                                height={120}
                              />
                              <div className="mb-2 mt-4 text-lg font-medium">
                                Workflows for your bussiness
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Create workflows, automate tasks, and build integrations,
                                forms, surveys, and quizzes. Collect responses in a
                                database. Send automated emails. Create a chatbot.
                                And so much more....
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <li className="row-span-1 col-span-1">
                        <ListItem href="/dashboard#bpmn" title="BPMN2">
                        Convert your text prompts into BPMN2 workflows.
                        </ListItem>
                        <p className="p-6"><Quote className="w-6 h-6 inline-block"/>
                        &nbsp;Effortlessly enabling visual representations of various business
                           processes. These intuitive services eliminate the need for 
                           programming expertise, guiding users through diagram creation 
                           and enabling seamless workflow automation
                            for optimized operations.</p>
                        
{/*                         <ListItem href="/dashboard#forms" title="Forms">
                          Create forms, surveys, and quizzes.
                        </ListItem>
                        <ListItem href="/dashboard#dmn" title="DMN">
                          Convert prompt to DMN decision tables and rules.
                        </ListItem> */}
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/showcases" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Showcases
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/documentation" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Documentation
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                {(isLogged==true&&onDashboard==false) ? (
                  <NavigationMenuItem>
                    <Link href="/dashboard" legacyBehavior passHref>
                      
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ) : (<></>)}  
                </NavigationMenuList>
              </NavigationMenu>
              
              {isLogged==true ? (
                <form action={logout} className="w-full">
                  <button className="absolute right-3 text-right h-[48px] grow items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600">
                    <div className="md:block">Sign Out</div>
                  </button>
                </form>
              ) : (
                <Link href="/login" legacyBehavior passHref>
                  <a className="absolute right-3 text-right h-[48px] grow items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600">
                    <div className="md:block">Sign In</div>
                  </a>
                </Link>
              )}
            </nav>
            <nav className="hidden w-full max-sm:block items-center gap-4">
             {/* puldown menu */}
             <Link
                href="/"
                className="mt-3 float-start"
              >
                <Image src="/logo.svg" alt="P2?" width={40} height={40} />
                <span className="sr-only">P2?</span>
              </Link>
             <Menubar className="float-end">
  <MenubarMenu>
    <MenubarTrigger>|||</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
      <Link href="/documentation">Documentation</Link>
      </MenubarItem>
      <MenubarItem><Link href="/showcases">Showcases</Link></MenubarItem>
      <MenubarSeparator />
      <MenubarItem><Link href="/dashboard" legacyBehavior passHref>Dashboard</Link></MenubarItem>
      <MenubarSeparator />
      {isLogged==true ? (
                <MenubarItem>
                <form action={logout}>
                  <button className="absolute right-3 text-right h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                    <div className="md:block">Sign Out</div>
                  </button>
                </form>
                </MenubarItem>
              ) : (
                <MenubarItem>
                <Link href="/login" legacyBehavior passHref>
                  <a className="absolute right-3 text-right h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                    <div className="md:block">Sign In</div>
                  </a>
                </Link>
                </MenubarItem>
              )}
    
    
    </MenubarContent>
  </MenubarMenu>
</Menubar>
            </nav>

              
          
          </header>

          </>
         ):(<>
            <header className="max-sm:mt-3 p-2 sticky items-center gap-4 bg-background/20 px-4 md:px-6">
            <nav className="max-sm:hidden h-[48]] gap-6 text-lg font-medium md:flex md:flex-initial md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
                href="/"
                className="items-center gap-2 text-lg font-semibold md:text-base"
              >
                <Image src="/logo.svg" alt="P2?" width={40} height={40} />
                <span className="sr-only">P2?</span>
              </Link>
              <Link href="/dashboard">Dashboard</Link>
            <form action={logout} className="h-[48px]">
                  <Button variant="outline" className="top-2 absolute right-3 h-[48px] gap-2">
                  <Avatar>
                  <AvatarImage src={avatar} />
                  <AvatarFallback>CN</AvatarFallback>
                  </Avatar><span>Sign Out</span>
                  </Button>
                </form>
            </nav>
            </header>
         </>)}
        </div>
      </>
    );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Menu;