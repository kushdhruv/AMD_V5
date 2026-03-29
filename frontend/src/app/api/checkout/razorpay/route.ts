import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Initialize Razorpay SDK (Standard implementation)
    // const Razorpay = require('razorpay');
    // const instance = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });

    // Mocking Razorpay API call for development/testing without keys
    // In production, uncomment the Razorpay SDK lines above and use instance.orders.create
    const mockOrder = {
      id: "order_" + Math.random().toString(36).substring(7),
      entity: "order",
      amount: amount * 100, // Razorpay uses paise
      amount_paid: 0,
      amount_due: amount * 100,
      currency: currency,
      receipt: receipt || "Receipt #1",
      offer_id: null,
      status: "created",
      attempts: 0,
      notes: notes || [],
      created_at: Math.floor(Date.now() / 1000)
    };

    // Return the created order to the mobile app
    return NextResponse.json(mockOrder);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
