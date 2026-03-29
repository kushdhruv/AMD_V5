'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RazorpayCheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'INR';
  const name = searchParams.get('name') || 'Event Ticket';
  const description = searchParams.get('description') || 'Purchase Confirmation';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Missing Order ID');
      setLoading(false);
      return;
    }

    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC_ for key
          amount: amount,
          currency: currency,
          name: name,
          description: description,
          order_id: orderId,
          handler: function (response: any) {
            // Payment success - redirected by webhook fulfillment usually
            // But let's show a success message here too.
            window.location.href = '/checkout/success';
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#3399cc',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
             setError(response.error.description);
        });
        rzp.open();
        setLoading(false);
      };
      script.onerror = () => {
        setError('Failed to load Razorpay SDK');
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, [orderId, amount, currency, name, description]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500">Payment Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <button 
          onClick={() => window.close()} 
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      ) : (
        <p className="text-gray-600">Initializing Secure Payment...</p>
      )}
    </div>
  );
}

export default function RazorpayCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RazorpayCheckoutContent />
    </Suspense>
  );
}
