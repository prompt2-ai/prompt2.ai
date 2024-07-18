import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      {
        error: {
          code: "no-access",
          message: "You are not signed in.",
        },
      },
      { status: 401 }
    );
  }
   const body = await req.json();
   if (!body.price||!body.price.startsWith("price_")) {
    return NextResponse.json(
      {
        error: {
          code: "missing-price",
          message: "Price is required.",
        },
      },
      { status: 400 }
    );
  }
 
  const priceId=body.price;
 
  if (session.user.stripeCustomerId !== body.customerId||session.user.id !== body.userId) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-customer",
          message: "Invalid customer.",
        },
      },
      { status: 400 }
    );
  }
  
  const Stripe = new stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
  });

  const checkoutSession = await Stripe.checkout.sessions.create({
    mode: "subscription",
    customer: session.user.stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: process.env.NEXT_PUBLIC_WEBSITE_URL + `/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  process.env.NEXT_PUBLIC_WEBSITE_URL+ `/O/subscriptions`,
    subscription_data: {
      metadata: {
        //This meta is added to provide a manual way to check, 
        //if a customer has an active subscription in Stripe, 
        //in case our webhook integration fails.
        payingUserId: session.user.id!,
      },
    },
  },{
    apiVersion: "2024-06-20",
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      {
        error: {
          code: "stripe-error",
          message: "Could not create checkout session",
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ session: checkoutSession }, { status: 200 });
}