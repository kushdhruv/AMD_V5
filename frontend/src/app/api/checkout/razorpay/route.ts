import { NextResponse } from 'next/server';
const Razorpay = require('razorpay');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes, app_id, user_id, ticket_id } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // If no keys, return mock for development
    if (!key_id || !key_secret) {
      console.warn('[Razorpay] Missing API Keys. Returning MOCK order.');
      const mockOrder = {
        id: "order_" + Math.random().toString(36).substring(7),
        entity: "order",
        amount: amount * 100,
        currency: currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: "created",
        notes: {
            app_id,
            user_id,
            ticket_id,
            is_mock: true
        }
      };
      return NextResponse.json(mockOrder);
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        app_id,
        user_id,
        ticket_id
      }
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);

  } catch (err: any) {
    console.error('[Razorpay Order Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
