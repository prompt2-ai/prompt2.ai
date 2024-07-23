import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LoginLeftSide from './loginLeftSide';
import LoginRightSide from './loginRightSide';
import { NextRequest } from "next/server";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";

type LoginProps = NextRequest& {
  searchParams?: {
  callbackUrl:string
  }
}

export default async function LoginPage(req:any) {//using LoginProps returns type error
const {callbackUrl} = req.searchParams?.callbackUrl ? req.searchParams : {callbackUrl:"/dashboard"};
const session= await getSession();

if (session) {
   if (callbackUrl) {
    redirect(callbackUrl);
    return <div>Redirecting...</div>
   }
}

return (
    <>
    <div className="p-[30px] lg:container m-10 overflow-hidden md:rounded-[0.5rem] md:border bg-background md:shadow">
      <div className="lg:relative lg:h-[800px] lg:flex-col lg:items-center lg:justify-center lg:justify-between lg:h-full sm:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "hidden lg:block absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <LoginLeftSide />
        <LoginRightSide callbackUrl={callbackUrl} />
      </div>
      </div>
    </>
  )
}