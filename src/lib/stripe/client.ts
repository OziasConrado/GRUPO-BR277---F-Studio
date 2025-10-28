import { loadStripe } from '@stripe/stripe-js';

// Note: This client-side utility to load Stripe.js is no longer
// directly used in the checkout flow since we are redirecting to
// Stripe's hosted page. However, it's good practice to keep it
// in case we need to implement client-side Stripe elements in the future.

let stripePromise: Promise<any | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      stripePromise = loadStripe(publishableKey);
    } else {
        console.error("Stripe publishable key is not set.");
        // Return a promise that resolves to null if the key is not set
        return Promise.resolve(null);
    }
  }
  return stripePromise;
};
