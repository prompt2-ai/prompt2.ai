import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { RocketIcon } from "@radix-ui/react-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Product = {
  name: string;
  type: string;
  price: string[];
  currencySymbol: string;
  productId: string[];
  features: string[][];
  active: boolean;
  footer: string;
  hasChangeButton: boolean;
};
const STRIPE_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
const STRIPE_YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;


const products: Product[] = [
  {
    name: "Start Free",
    type: "forever",
    currencySymbol: "€",
    price: ["0", "0"],
    productId: ["free", "free"], //monthly and yearly
    features: [[
      "Free: forever",
      "Bring your tokens: required",
      "Public workflows: unlimited",
      "Private workflows: none",
      "Support: community only",
      "Finetune: none",
    ], [
      "Free: forever",
      "Bring your tokens: required",
      "Public workflows: unlimited",
      "Private workflows: none",
      "Support: community only",
      "Finetune: none",
    ]
    ],
    active: true,
    footer: `Signing up and start creating workflows.<br />
          Just bring your tokens.<br />`,
    hasChangeButton: false,
  },
  {
    name: "Standard Plan (Recomented)",
    type: "subscription",
    currencySymbol: "€",
    price: ["16,30", "15.4/month (Charged annually)"],
    productId: [STRIPE_MONTHLY_PRICE_ID!, STRIPE_YEARLY_PRICE_ID!],
    features: [[
      "Tokens: 100K",
      "Bring your tokens: optional",
      "Buy more tokens: optional",
      "Public workflows: unlimited",
      "Private workflows: 10",
      "Support: by email",
      "Finetune: none",
    ], [
      "Tokens: 1.2M",
      "Bring your tokens: optional",
      "Buy more tokens: optional",
      "Public workflows: unlimited",
      "Private workflows: 10",
      "Support: by email",
      "Finetune: none",
    ]],
    active: true,
    footer: `Create workflows right now, without any hassle!.<br />
          You can cancel anytime.`,
    hasChangeButton: true,

  },
  {
    name: "Enterprize",
    type: "custom",
    price: ["ask us", "ask us"],
    currencySymbol: "",
    productId: ["custom", "custom"], //monthly and yearly
    features: [[
      "Tokens: on demand",
      "Bring your tokens: optional",
      "Buy more tokens: optional",
      "Public workflows: unlimited",
      "Private workflows: unlimited",
      "Support: 1 hour video call, per month",
      "Finetune: on demand",
    ], [
      "Tokens: on demand",
      "Bring your tokens: optional",
      "Buy more tokens: optional",
      "Public workflows: unlimited",
      "Private workflows: unlimited",
      "Support: 1 hour video call, per month",
      "Finetune: on demand",
    ]],
    active: false,
    footer: `Customize your plan to your needs.\n<br />
          Contact us to get a quote.`,
    hasChangeButton: false,
  }
];

export function ProductCard({
  selectedPlan,
  selectedType,
  product,
  handler
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  selectedType: {
    type: string;
    setType: React.Dispatch<React.SetStateAction<string>>;
  };
  product: Product;
  handler: any;
}) {

  const type = selectedType.type;
  const productId: string = type === "monthly" ? product.productId[0] : product.productId[1];
  const price: string = type === "monthly" ? product.price[0] : product.price[1];
  const features: string[] = type === "monthly" ? product.features[0] : product.features[1];
  const { data: session, status } = useSession();


  const contatForm = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" className="w-full">Contact us</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ask for custom plan</DialogTitle>
            <DialogDescription>
              Contact us to get a quote.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={"" + (session ? session.user.name : "")} placeholder="your name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                email
              </Label>
              <Input id="email" value={"" + (session ? session.user.email : "")} placeholder="your email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea id="message" value="" placeholder="your message" className="col-span-3" />
            </div>
            <Input type="hidden" id="stripe_id" value={"" + (session ? session.user.stripeCustomerId : "")} />
          </div>
          <DialogFooter>
            <Button type="submit">Send message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
        selectedPlan.setPlan(productId);
      }
      }
      className={`cursor-pointer lg:flex-inline  ${selectedPlan.plan === productId ? "-translate-y-2 bg-orange-400/50" : "hover:-translate-y-2 hover:bg-orange-400/50"} subscription ${product.active ? "disabled:opacity-50" : ""}`}>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        {product.hasChangeButton && <div className="flex mb-6 m-auto">
          <Button variant={selectedType.type == "monthly" ? "default" : "outline"}
            className="m-2"
            onClick={(e) => {
              e.preventDefault();
              selectedType.setType("monthly");
              selectedPlan.setPlan(productId);
            }}>
            Monthly
          </Button>
          <Button variant={selectedType.type == "yearly" ? "default" : "outline"}
            className="m-2"
            onClick={(e) => {
              e.preventDefault();
              selectedType.setType("yearly");
              selectedPlan.setPlan(productId);
            }}>
            Yearly
          </Button>
        </div>
        }
        <CardDescription>{product.currencySymbol}{price} {product.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4 ">
          {features.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </CardContent>

      <CardFooter dangerouslySetInnerHTML={{ __html: product.footer }} />
      <CardFooter>
        <>
          {productId && productId.startsWith("price_") && status === "unauthenticated" &&
            <>
              <Alert className="w-full mx-2">
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  Sign in to pick the Standard Plan!
                </AlertDescription>
              </Alert>

              <Button variant="default"
                onClick={async (e) => { await signIn(undefined, {redirect: true, redirectTo:"/O/subscriptions", callbackUrl: "/O/subscriptions" }); }}
                className='w-full'>
                Sign in</Button>
            </>
          }
          {productId && productId.startsWith("price_") && status === "authenticated" && session.user.role === "user" &&
            <Button 
              variant="destructive"
              onClick={async (e) => { handler({ productId, type, price }) }}
              className='w-full'>
              Select</Button>
          }

          {productId && productId.startsWith("price_") && status === "authenticated" && session.user.role === "subscriber" &&
            <Button variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const portalUrl = new URL(process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL as string);
                  window.location.href = portalUrl.toString();
                } catch (error) {
                  console.error("Error redirecting to stripe customer portal", error);
                }
              }}
              className='w-full'>
              Manage Your Subscription</Button>}
          {productId && productId.startsWith("free") && status === "unauthenticated" &&
            <Button variant="default"
              onClick={async (e) => { await signIn(undefined, {redirect: true, redirectTo:"/dashboard", callbackUrl: "/dashboard" }); }}
              className='w-full'>
              Sign in</Button>}
          {productId && productId.startsWith("custom") && contatForm()}
        </>
      </CardFooter>
    </Card>
  );
}

export default function PricingTable({
  selectedPlan,
  selectedType,
  handler
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  selectedType: {
    type: string;
    setType: React.Dispatch<React.SetStateAction<string>>;
  };
  handler: any;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {products.map((product, index) => (
          <ProductCard
            selectedPlan={selectedPlan}
            selectedType={selectedType}
            product={product}
            key={index}
            handler={handler}
          />
        ))}
      </div>
    </>
  );
}