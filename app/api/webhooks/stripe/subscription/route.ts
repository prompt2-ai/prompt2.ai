import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from 'uuid'

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SUBSCRIPTION_SECRET!;


const createSubscription = async (subscription: Stripe.Subscription) => {
           const stripeSubscriptionId = subscription.id;
           const stripeCurrentPeriodEnd = subscription.current_period_end*1000;//fix from unix timestamp to mysql timestamp
           const stripeCurrentPeriodStart = subscription.current_period_start*1000;//fix from unix timestamp to mysql timestamp
           const plan = subscription.items.data[0].price.recurring?.interval;
  
           //get userId from stripeCustomerId from Users table

           const user = await db.User.findOne({ where: { stripeCustomerId:subscription.customer as string } });
           //add tokens to user, 100K tokens for monthly, 1M tokens for yearly
           const tokens = plan === "month" ? 100000 : 1000000;
           try {
             await db.Tokens.create( //updatedAt,createdAt added by sequelize
               {
                 id:uuidv4(),
                 userId: user?.get("id"),
                 value: tokens,
                 purchasedAt: new Date(),
                 source: "subscription",
                 validFrom: new Date(stripeCurrentPeriodStart),
                 expires: new Date(stripeCurrentPeriodEnd)
                }
             );
             console.log("User updated with tokens on subscription creation - customer: %s, subId: %s, tokens:%s",subscription.customer, stripeSubscriptionId, tokens);
           } catch (error) {
             console.error("Error updating user with tokens on subscription creation", error);
             return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
           }
}

const updateSubscription = async (subscription: Stripe.Subscription) => {
           //const customer = await stripe.customers.retrieve(subscription.customer as string);
           const stripeSubscriptionId = subscription.id;
           const stripePriceId = subscription.items.data[0].price.id;
           const stripeCurrentPeriodEnd = subscription.current_period_end*1000;//fix from unix timestamp to mysql timestamp
           const stripeCurrentPeriodStart = subscription.current_period_start*1000;//fix from unix timestamp to mysql timestamp
           const role = "subscriber";
           const plan = subscription.items.data[0].price.recurring?.interval;
           //update user with stripeSubscriptionId, role, plan, stripe_current_period_end, stripe_price_id, is_active
           try {
             await db.User.update( //updatedAt added by sequelize
              { stripeSubscriptionId, role, plan,stripeCurrentPeriodStart, stripeCurrentPeriodEnd, stripePriceId },
              { where: { stripeCustomerId:subscription.customer as string } }
            );
            console.log("User updated on subscription update  - customer: %s, subId: %s, role:%s, scpe:%s, spId:%s",subscription.customer, stripeSubscriptionId, role, plan, stripeCurrentPeriodEnd, stripePriceId); 
          } catch (error) {
            console.error("Error updating user on subscription update", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
           }

}

const cancelSubscription = async (subscription: Stripe.Subscription) => {
  try {
    await db.User.update( //updatedAt added by sequelize
      {
        role: "user",
        plan: "free",
      },
      { where: { stripeCustomerId:subscription.customer as string } }
    );
    console.log("User updated on subscription deletion - customer: %s, subId:%s",subscription.customer,subscription.id);
  } catch (error) {
    console.error("Error updating user on subscription deletion", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const POST = async (req: NextRequest) => {
  try {
    //https://github.com/stripe/stripe-node#configuration 
    const stripe = new Stripe(process.env.STRIPE_SECRET!, {
      apiVersion: "2024-06-20",
    });

    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      // return a 400 response to the webhook
      if (err! instanceof Error) console.log(err);
      console.log(`Error on stripe constructEvent: ${message}`);
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${message}`,
          },
        },
        { status: 400 }
      );
    }
    // Handle the event 
    const subscription = event.data.object as Stripe.Subscription;
    switch (event.type) {
      case "customer.subscription.updated":
        console.log("subscription updated");
        await updateSubscription(subscription);
        break;
      case "customer.subscription.created":
        console.log("subscription created");
        await createSubscription(subscription);//add tokens to user
        break;
      case "customer.subscription.deleted":
        console.log("subscription deleted");
        await cancelSubscription(subscription);
        break;
      default:
        console.warn(`Unknown event type: ${event.type}`);
        break;
    }
    // Return a 200 response.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in webhook handler", error);
    return NextResponse.json(
      {
        error: {
          message: `Method Not Allowed`,
        },
      },
      { status: 405 }
    ).headers.set("Allow", "POST");
  }
};
