//NEXTAUTH
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import SequelizeAdapter from "@auth/sequelize-adapter"
import db from "@/db";
import Stripe from 'stripe';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  adapter: SequelizeAdapter(db.sequelize),
  session: {
     strategy:'jwt', //to be able to run on edge midleware we cant use database to store session
  },
  callbacks: {
    async session({session,token}) {
      // Add some more data to the session
      const user = await db.User.findOne({ where: { email: session.user.email } }) as any;//TODO: fix this any
      session.user.id = token.sub!;
      session.user.role = user?user.role:"user";
      session.user.plan = user?user.plan:"free";
      session.user.stripeCustomerId = user?user.stripeCustomerId:"";
      session.user.apiKey = user?user.apiKey:"";
      return session;
    }
  },
  events: {
    createUser: async ({user}) => {
    //All new users will be potential customers, and at the time of creation, we will create a new customer in stripe
    //and update the user with the stripeCustomerId and plan as free
    try {
      //create a new customer in stripe and update the user with the stripeCustomerId
      const stripe = new Stripe(process.env.STRIPE_SECRET!, {
        apiVersion: "2024-06-20",
    });
    await stripe.customers.create({
        email: user.email!,
        name: user.name!,
    })
    .then(async (customer) => {
      await db.User.update( //updatedAt added by sequelize
        { stripeCustomerId: customer.id },
        { where: { id: user.id } }
      );
    });
    } catch (error) {
      console.log('error',error);
    }
},
  }
});
