/* if the user is not subscribed, show subscription plans */
/* if already subscribed, show selected subscription details */
/* but allow to downgrade on free subscription */
/* to choose a subscription plan, user must be logged in */
/* so if not logged in, redirect to login page and then redirect back to selected subscription */
"use client";
import { useState } from "react";
import SubscriptionsTable from "@/components/custom/subscriptions";
import preparedStripe from "@/lib/stripe";
import { Separator } from "@/components/ui/separator"
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Subscriptions() {
  const { data: session, status } = useSession();
  const [type, setType] = useState<string>('monthly')
  const [plan, setPlan] = useState<string>('prod_QT5YDjtZwd4XKH')
  
  const handler = async (thePlan:any) => {
    //check if the user is logged in
    if (!session?.user) {
      await signIn(undefined, {redirect: true, redirectTo:"/O/subscriptions", callbackUrl: `/O/subscriptions` });
      return;
    }
    const stripe = await preparedStripe(); 
    //if thePlan.productId starts with price_ then it is a subscrfiption id
    if (thePlan.productId && thePlan.productId.startsWith("price_")) { 
    //get stripe session from /api/stripe/checkout/session route, 
    const res = await fetch(`/api/stripe/checkout/session`, {
      method: "POST",
      body:JSON.stringify({price:thePlan.productId, userId:session.user.id, customerId:session.user.stripeCustomerId}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const checkoutSession = await res.json().then((value) => {
      return value.session;
    });
    //redirect to stripe checkout page
    const { error } = await stripe!.redirectToCheckout({
      sessionId: checkoutSession.id,
    });

    //if there is an error, log it
    console.error(error);
    //and return
    return;
  }
}

  return (
    <>
    <div className="lg:container">
    <div>
      <h1 className="text-2xl font-bold mt-4">Choose your path.</h1>
      <Separator className="my-4" />
      <div>
        <SubscriptionsTable selectedPlan={{plan:plan, setPlan:setPlan}} selectedType={{type:type, setType:setType}} handler={handler} />
      </div>
    </div>
<h1 className="text-2xl font-bold mt-4">FAQ</h1>
<Accordion type="single" collapsible>
{(!session||session.user.role === "user") && <AccordionItem value="How to select the Standard Plan?">
    <AccordionTrigger>How to select the Standard Plan?</AccordionTrigger>
    <AccordionContent>
    {status!=="authenticated" && <>You have to login first, to be able to select the Standard Plan subscription <Button onClick={()=>signIn()}>Sign in</Button></>}
    {status==="authenticated" && <>You can select the Standard Plan from the pricing table above,
    choose "monthly" or "annual" and press the "Select" button to redirect to the payment page.</>}
    </AccordionContent>
  </AccordionItem>}
  <AccordionItem value="What means 'Bring your tokens'?">
    <AccordionTrigger>What means 'Bring your tokens'?</AccordionTrigger>
    <AccordionContent>    
    You can integrate your Gemini LLM API key on our platform. 
    While we won't charge you anything, Gemini's API usage fees will apply from their side.
    For more information, consult our documentation <Link href="/documentation">here</Link>.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="Can I cancel my subscription?">
    <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
    <AccordionContent>    
    Absolutely! You can cancel your subscription anytime, which will switch you to the free plan at the end of your current billing period.
    {session&&session.user.role === "subscriber" && <p>Use the "Manage Your Subscription" button to cancel or change your subscription.</p>}
    </AccordionContent>
  </AccordionItem>  
</Accordion>
</div>
</>
  );
}
