import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(body)
          .digest('hex');

        if (expectedSignature !== signature) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    // Handle payment.captured event
    if (event === 'payment.captured' || event === 'order.paid') {
      const { notes } = payload.payload.order ? payload.payload.order.entity : payload.payload.payment.entity;
      const { user_id, app_id, ticket_id } = notes;

      if (user_id && app_id && ticket_id) {
        // Insert ticket into user_tickets table
        const { error } = await supabase.from('user_tickets').insert({
          user_id,
          event_id: app_id,
          ticket_id,
          qr_code: `TKT-${payload.payload.payment ? payload.payload.payment.entity.id : Date.now()}`,
          status: 'successful'
        });

        if (error) {
          console.error('[Razorpay Webhook] Supabase Insert Error:', error);
          return NextResponse.json({ error: 'Failed to fulfill ticket' }, { status: 500 });
        }

        console.log(`[Razorpay Webhook] Ticket fulfilled for user ${user_id} in app ${app_id}`);
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
