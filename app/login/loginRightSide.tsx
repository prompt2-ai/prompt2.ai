import { redirect } from "next/navigation"
import UserAuthForm from '@/app/login/form';
import { signIn } from '@/auth';
import { AuthError } from "next-auth";
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginRightSide() {  
    return (
        <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an Account/Login in
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login in.
            </p>
          </div>
          <UserAuthForm />
          <h1>OR</h1>
          <form
          action={async () => {
            "use server"
            try {
              await signIn('github')
            } catch (error) {
              // Signin can fail for a number of reasons, such as the user
              // not existing, or the user not having the correct role.
              // In some cases, you may want to redirect to a custom error
              if (error instanceof AuthError) {
                return redirect(`/?error=${error.type}`)
              }
 
              // Otherwise if a redirects happens NextJS can handle it
              // so you can just re-thrown the error and let NextJS handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error
            }
          }}
        >
          <button type="submit">
            <span>Sign in with Github</span>
          </button>
        </form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="legal/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    )
}