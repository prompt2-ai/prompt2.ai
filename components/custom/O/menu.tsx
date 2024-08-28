"use client"; // This is a client-side component, use this directive to avoid SSR errors like "(0 , react__WEBPACK_IMPORTED_MODULE_0__.createContext) is not a function"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

import ThemeToggle from "@/components/custom/themeToggle";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import Link from "next/link";
import Image from 'next/image';
import { cn } from "@/lib/utils"
import { Quote } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react"

export const Menu = () => {
  const { data: session, status } = useSession();
  const [isLogged, setIsLogged] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarFallback, setAvatarFallback] = useState("");

  useEffect(() => {
    const run = async () => {
      const s = session;
      if (s === undefined || s === null) {
        setIsLogged(false);
      } else {
        setIsLogged(true);
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
      }
    };
    run();
  }, [session]);

  return (
    <div className="w-full">
      <header className="max-sm:mt-3 p-2 sticky items-center gap-4 bg-background/20 px-4 md:px-6">

        <nav className="max-md:hidden text-lg font-medium lg:flex lg:flex-initial lg:items-center lg:text-sm lg:gap-6">
          <Link
            href="/O"
            className="items-center gap-2 text-lg font-semibold lg:text-base"
          >
            <Image src="/logo.svg" alt="P2?" width={40} height={40} />
            <span className="sr-only">P2?</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-6 lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/O"
                        >
                          <Image
                            src="/logo.svg"
                            alt="P2?"
                            width={120}
                            height={120}
                          />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            BPMN 2.0 Workflows for your bussiness
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                          Traditionally, creating BPMN diagrams required specialized software and technical expertise.
                          But now, you can generate workflow diagrams effortlessly.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li className="row-span-1 col-span-1">
                      <ListItem href="/dashboard" title="BPMN 2.0">
                        Convert your text prompts into BPMN 2.0 workflows.
                      </ListItem>
                      <p className="p-6"><Quote className="w-6 h-6 inline-block" />
                        &nbsp; Simply provide a text description of your process, and Prompt2.ai's AI-powered engine will automatically create a professional-looking BPMN diagram for you.
                      </p>
                      {/* <ListItem href="/dashboard#forms" title="Forms">
                          Create forms, surveys, and quizzes.
                        </ListItem>
                        <ListItem href="/dashboard#dmn" title="DMN">
                          Convert prompt to DMN decision tables and rules.
                        </ListItem> */}
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/*<NavigationMenuItem>
                <Link href="/O/showcases" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Showcases
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>*/}
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/O/subscriptions" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {isLogged && "Subscription"}
                    {!isLogged && "Pricing"}
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
              {isLogged && (
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {isLogged == true ? (
            <Button onClick={() => signOut()} variant="outline" className="top-1 absolute right-16 h-[48px] gap-2">
              <Avatar>
                <AvatarImage src={avatar} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar><span>Sign Out</span>
            </Button>
          ) : (
            <Link href="/login" className="absolute right-16">Sign In</Link>
          )}
          <div className="absolute right-3"><ThemeToggle /></div>
        </nav>

        <nav className="hidden w-full max-md:block items-center gap-4">
          {/* puldown menu */}
          <Link
            href="/O"
            className="mt-3 float-start"
          >
            <Image src="/logo.svg" alt="P2?" width={40} height={40} />
            <span className="sr-only">P2?</span>
          </Link>
          <Menubar className="float-end mr-12">
            <MenubarMenu>
              <MenubarTrigger>|||</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/documentation">Documentation</Link>
                </MenubarItem>
               {/* <MenubarItem><Link href="/O/showcases">Showcases</Link></MenubarItem>*/}
                <MenubarSeparator />
                <MenubarItem><Link href="/O/subscriptions">
                  {isLogged && "Subscription"}
                  {!isLogged && "Pricing"}</Link></MenubarItem>
                <MenubarSeparator />
                {isLogged && <MenubarItem><Link href="/dashboard" legacyBehavior passHref>Dashboard</Link></MenubarItem>}
                <MenubarSeparator />
                {isLogged == true ? (
                  <MenubarItem>

                    <Button
                      onClick={() => signOut()}
                      className="right-3 h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                      <div className="md:block text-black">Sign Out</div>
                    </Button>

                  </MenubarItem>
                ) : (
                  <MenubarItem>
                    <Link href="/login" legacyBehavior passHref>
                      <a className="right-3 text-center text-black h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                        <div className="md:block text-black">Sign In</div>
                      </a>
                    </Link>
                  </MenubarItem>
                )}
                
              </MenubarContent>
            </MenubarMenu>
            <div className="float-right absolute right-3"><ThemeToggle /></div>
          </Menubar>
        </nav>
      </header>
    </div>
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