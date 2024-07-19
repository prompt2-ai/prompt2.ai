/* hese user can change name and can add the Gemini API key */
'use client';

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loader from '@/components/custom/loader'

interface User {
  "id": string;
  "name": string;
  "email": string;
  "phone": string | null;
  "emailVerified": boolean | null;
  "phoneVerified": boolean | null;
  "image": string | null;
  "apiKey": string | null;
  "stripeCustomerId": string | null;
  "stripeSubscriptionId": string | null;
  "stripePriceId": string | null;
  "stripeCurrentPeriodEnd": Date | null;
  "isActive": boolean;
  "role": "admin" | "user" | "subscriber";
  "plan": "month" | "year" | "free";
  "createdAt": Date;
  "updatedAt": Date;
}

export default function Profile() {
  const { status } = useSession();
  const [user, setUser] = useState({} as User);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    phone: z.string().optional().or(z.literal("")),
    apiKey: z.string().regex(/^AIzaSy[0-9a-zA-Z-_+]{33}$/, "Invalid API key").optional().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      console.log("User has changed");
      return user;
    }, [user]) as z.infer<typeof formSchema>,
  });
  useEffect(() => {
    const run = async () => {
      //fetch the profile of the user from api
      await fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          console.log(data.user);
          setUser(data.user);
          form.reset(data.user);
        });
    }
    run();
  }, []);

  //form submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.user);
        form.reset(data.user);
        //reload the page, needed to set the changes in the session
        window.location.reload();
      });
  }

if (status === "loading") {
  return <Loader></Loader>;
} 
//deny if user is not logged in
if (status === "unauthenticated") {
  return <div>Access Denied</div>;
}

return (
    <>
    <div className="w-full lg:container mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone" {...field} />
                </FormControl>
                <FormDescription>
                  This is your phone number. You can set it up if you want to receive notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="aistudio API key" {...field} />
                </FormControl>
                <FormDescription>
                  This is your Gemini API key. If you set this up, then you will use your tokens to call the Gemini API. You can generate your API key from <Link href="https://aistudio.google.com/app/apikey" target="_blank"><strong>here</strong></Link>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update</Button>
        </form>
      </Form>
    </div>
    </>
  );
}