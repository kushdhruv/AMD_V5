
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { planId, userId, email, currency = 'usd' } = await request.json();

    if (!planId || !userId) {
      return Response.json({ error: "Missing planId or userId" }, { status: 400 });
    }

    // Map planId to Stripe Price ID (Replace with real Price IDs)
    const PLANS = {
      creator: {
        priceId: currency === 'inr' ? process.env.STRIPE_PRICE_CREATOR_INR : process.env.STRIPE_PRICE_CREATOR,
        credits: 1000,
        name: "Creator Plan"
      },
      pro: {
        priceId: currency === 'inr' ? process.env.STRIPE_PRICE_PRO_INR : process.env.STRIPE_PRICE_PRO,
        credits: 5000,
        name: "Pro Agency Plan"
      }
    };

    const selectedPlan = PLANS[planId];
    if (!selectedPlan) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = headers().get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      // We will let Stripe Dashboard automatically decide the available payment methods
      // like GPay, Apple Pay, UPI (QR Code), CashApp, Alipay etc based on your region!
      // By omitting payment_method_types, Stripe automatically uses your dashboard settings.
      // Make sure those methods are enabled in your Stripe Dashboard!
      
      mode: "subscription",
      customer_email: email, // Pre-fill email
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        planId: planId,
        credits: selectedPlan.credits,
      },
      success_url: `${origin}/dashboard/pricing?success=true`,
      cancel_url: `${origin}/dashboard/pricing?canceled=true`,
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
