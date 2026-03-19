
import Stripe from "stripe";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase/client"; // Use admin client if possible, but here we might need service_role key for secure updates

// Ideally use a Service Role client for webhooks to bypass RLS
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Needed for admin updates
);

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return Response.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, planId, credits } = session.metadata;

        // Fetch current profile to get existing credits
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("credits")
            .eq("id", userId)
            .single();

        const currentCredits = profile?.credits || 0;
        const newCredits = currentCredits + Number(credits);

        // Update User Profile
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            stripe_customer_id: session.customer,
            subscription_id: session.subscription,
            subscription_status: "active",
            plan: planId === "pro" ? "Pro" : "Creator",
            credits: newCredits,
          })
          .eq("id", userId);
        console.log(`User ${userId} upgraded to ${planId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // Find user by subscription_id
        const { data: users } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("subscription_id", subscription.id);
        
        if (users && users.length > 0) {
            await supabaseAdmin
                .from("profiles")
                .update({ 
                    subscription_status: "canceled",
                    plan: "Free" 
                })
                .eq("id", users[0].id);
            console.log(`User ${users[0].id} subscription canceled`);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook handler failed: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }

  return Response.json({ received: true });
}
