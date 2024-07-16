import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const preparedStripe = () => {
  if (!stripePromise) {

    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
  }
  return stripePromise;
};

export default preparedStripe;