export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
    //console.log("STRIPE CHECKOUT GET");
    return new Response(
        "This is a webhook endpoint for Stripe Checkout",
        { status: 200 });
}

export async function POST(req: Request) {
    const body = await req.text();
    return new Response(null, { status: 200 });
}
