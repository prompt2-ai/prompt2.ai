"use client";
import HeaderImage from "@/public/header.jpg";
import Player from 'next-video/player';
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
<main  className="lg:container w-full p-8">
  <div id="frontHeader" className="w-full min-h-[500px] z-10 md:flex items-center justify-center lg:bg-gradient-to-b from-orange-300 to-orange-700 lg:shadow-2xl lg:p-8">
     <Player 
     src={process.env.NEXT_PUBLIC_WEBSITE_URL+"/headerVideo.mp4"}
     poster={HeaderImage.src}
     blurDataURL={HeaderImage.blurDataURL}
     className="lg:border-2 md:border-8 md:border-black lg:border-white"/>
  </div>
<div className="p-0 mt-8 lg:flex">
<Card className="lg:w-2/4 lg:flex-inline mt-2 lg:mr-2">
  <CardHeader>
    <CardTitle>Start Free</CardTitle>
    <CardDescription>Just bring your tokens</CardDescription>
  </CardHeader>
  <CardContent>
    <p>You can use our service free, just bring your tokens, or buy one of our subscriptions to create workflows without any hassle.</p>
  </CardContent>
  <CardFooter>
  <p><Link className={cn(
            buttonVariants({ variant: "default" }),"")} href="/documentation">Found out more!</Link></p>
  </CardFooter>
</Card>
{/*
<Card className="lg:w-1/3 lg:flex-inline mt-2 lg:mr-2">
  <CardHeader>
    <CardTitle>Get Inspiration</CardTitle>
    <CardDescription>Look what other users have create</CardDescription>
  </CardHeader>
  <CardContent>
    <p>You don't know how to start? Look at workflows made by other users to get inspiration and remix them to your needs. </p>
  </CardContent>
  <CardFooter>

  <p><Link className={cn(
            buttonVariants({ variant: "default" }),"")} href="/showcases">Showcases</Link></p>
  </CardFooter>
</Card>
*/}
<Card className="lg:w-2/4 lg:flex-inline mt-2">
  <CardHeader>
    <CardTitle>It&apos;s Easy</CardTitle>
    <CardDescription>It has never been easier to create BPMN2 workflows</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Simply describe your business workflow using plain English to create a complete workflow.</p>
  </CardContent>
  <CardFooter>
    <p><Link className={cn(
            buttonVariants({ variant: "destructive" }),"")} href="/dashboard">Start Now!</Link></p>
  </CardFooter>
</Card>
</div>
</main>
  );
}
