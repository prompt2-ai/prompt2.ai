import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LoginLeftSide from './loginLeftSide';
import LoginRightSide from './loginRightSide';
 
export default function LoginPage() {

  return (
    <>
    <div className="overflow-hidden md:rounded-[0.5rem] md:border bg-background md:shadow">
      <div className="lg:container lg:relative lg:h-[800px] lg:flex-col lg:items-center lg:justify-center lg:justify-between lg:h-full sm:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
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
        <LoginRightSide />
      </div>
      </div>
    </>
  )
}