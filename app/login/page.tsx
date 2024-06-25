import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LoginLeftSide from './loginLeftSide';
import LoginRightSide from './loginRightSide';
 
export default function LoginPage() {

  return (
    <>

    <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow">
      <div className="container relative hidden h-[800px] flex-col items-center justify-center justify-between h-full md:grid sm:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <LoginLeftSide />
        <LoginRightSide />
      </div>
      </div>
    </>
  )
}