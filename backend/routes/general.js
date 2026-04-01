import { Router } from "express";
import Groq from "groq-sdk";
import Stripe from "stripe";
import { supabase, supabaseAdmin } from "../services/supabase.js";
import crypto from "crypto";

const router = Router();

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    const projectId = req.query.project_id;
    const formData = req.body;
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });

    const { data, error } = await supabase
      .from("registrations")
      .insert({ project_id: projectId, email: formData.email, name: formData.name, form_data: formData })
      .select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed: " + error.message });
  }
});

// POST /api/checkout (Stripe)
router.post("/checkout", async (req, res) => {
  try {
    const { planId, userId, email, currency = "usd" } = req.body;
    if (!planId || !userId) return res.status(400).json({ error: "Missing planId or userId" });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const PLANS = {
      creator: { priceId: currency === "inr" ? process.env.STRIPE_PRICE_CREATOR_INR : process.env.STRIPE_PRICE_CREATOR, credits: 1000, name: "Creator Plan" },
      pro: { priceId: currency === "inr" ? process.env.STRIPE_PRICE_PRO_INR : process.env.STRIPE_PRICE_PRO, credits: 5000, name: "Pro Agency Plan" },
    };
    const selectedPlan = PLANS[planId];
    if (!selectedPlan) return res.status(400).json({ error: "Invalid plan" });

    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      metadata: { userId, planId, credits: selectedPlan.credits },
      success_url: `${origin}/dashboard/pricing?success=true`,
      cancel_url: `${origin}/dashboard/pricing?canceled=true`,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/checkout/razorpay
router.post("/checkout/razorpay", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, app_id, user_id, ticket_id } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return res.json({
        id: "order_" + Math.random().toString(36).substring(7), entity: "order",
        amount: amount * 100, currency, receipt: receipt || `rcpt_${Date.now()}`,
        status: "created", notes: { app_id, user_id, ticket_id, is_mock: true },
      });
    }

    const Razorpay = (await import("razorpay")).default;
    const instance = new Razorpay({ key_id, key_secret });
    const order = await instance.orders.create({
      amount: Math.round(amount * 100), currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: { app_id, user_id, ticket_id },
    });
    res.json(order);
  } catch (err) {
    console.error("[Razorpay Order Error]:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// POST /api/webhook/stripe
router.post("/webhook/stripe", async (req, res) => {
  // Note: For Stripe webhooks, the body must be raw text — handled in server.js
  const body = req.rawBody || req.body;
  const signature = req.headers["stripe-signature"];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(typeof body === "string" ? body : JSON.stringify(body), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, planId, credits } = session.metadata;
        const { data: profile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single();
        const newCredits = (profile?.credits || 0) + Number(credits);
        await supabaseAdmin.from("profiles").update({
          stripe_customer_id: session.customer, subscription_id: session.subscription,
          subscription_status: "active", plan: planId === "pro" ? "Pro" : "Creator", credits: newCredits,
        }).eq("id", userId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const { data: users } = await supabaseAdmin.from("profiles").select("id").eq("subscription_id", subscription.id);
        if (users?.length > 0) await supabaseAdmin.from("profiles").update({ subscription_status: "canceled", plan: "Free" }).eq("id", users[0].id);
        break;
      }
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  res.json({ received: true });
});

// POST /api/webhook/razorpay
router.post("/webhook/razorpay", async (req, res) => {
  try {
    const body = typeof req.rawBody === "string" ? req.rawBody : JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (secret && signature) {
      const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
      if (expected !== signature) return res.status(400).json({ error: "Invalid signature" });
    }
    const payload = typeof body === "string" ? JSON.parse(body) : body;
    const event = payload.event;
    if (event === "payment.captured" || event === "order.paid") {
      const { notes } = payload.payload.order ? payload.payload.order.entity : payload.payload.payment.entity;
      const { user_id, app_id, ticket_id } = notes;
      if (user_id && app_id && ticket_id) {
        await supabase.from("user_tickets").insert({
          user_id, event_id: app_id, ticket_id,
          qr_code: `TKT-${payload.payload.payment ? payload.payload.payment.entity.id : Date.now()}`,
          status: "successful",
        });
      }
    }
    res.json({ status: "ok" });
  } catch (err) {
    console.error("[Razorpay Webhook Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat-edit (website builder chat)
router.post("/chat-edit", async (req, res) => {
  try {
    const { message, chatHistory, currentBlueprint, currentTheme } = req.body;
    if (!message || !currentBlueprint) return res.status(400).json({ error: "Missing message or blueprint" });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are an expert AI website structural engineer and designer.\nYour task is to modify a Website JSON Blueprint and Theme based on the user's Natural Language Instruction.\n\nRules:\n1. Parse the provided 'current_blueprint' and 'current_theme' JSON.\n2. Interpret the 'instruction' to understand what needs to change.\n3. Apply the changes strictly to the relevant parts.\n4. If the user asks to ADD a new section, add a new object to the appropriate place.\n5. If the user asks to CHANGE an existing element, locate and modify it.\n6. If the user asks to CHANGE COLORS, FONTS, or STYLES, modify the 'theme' object.\n7. Make changes robust.\n8. Do NOT change unrelated fields.\n9. Ensure the JSON is valid.\n10. Output: { "blueprint": <FULL_UPDATED_BLUEPRINT_JSON>, "theme": <FULL_UPDATED_THEME_JSON>, "message": "<SHORT_CONFIRMATION_TEXT>" }.\n11. Return ONLY the JSON object. No markdown.` },
        ...(chatHistory || []).map((msg) => ({ role: msg.role === "user" ? "user" : "assistant", content: msg.role === "assistant" ? (msg.content || "Updated the website.") : msg.content })),
        { role: "user", content: `Current Blueprint: ${JSON.stringify(currentBlueprint, null, 2)}\nCurrent Theme: ${JSON.stringify(currentTheme || {}, null, 2)}\n\nInstruction: ${message}` },
      ],
      temperature: 0.1, max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) throw new Error("No response from AI");
    res.json(JSON.parse(responseContent));
  } catch (error) {
    console.error("Chat edit error:", error);
    res.status(500).json({ error: "Failed to update website: " + error.message });
  }
});

export default router;
