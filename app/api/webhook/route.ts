// webhook.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('Webhook received');

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('No stripe-signature header present.');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log(`Webhook event constructed: ${event.type}`);
  } catch (err: any) {
    console.error('Error verifying webhook signature:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Process the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`Processing event: ${event.type}`);
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err.message);
    return NextResponse.json({ error: `Webhook processing error: ${err.message}` }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'payment'   && session.payment_status === 'paid') {
    const customerId = session.customer as string;
    const paymentIntentId = session.payment_intent as string;

    console.log('Retrieving payment intent with ID:', paymentIntentId);

    // Retrieve the payment intent to get payment details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Retrieve the product details from the line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price?.id;
    const price = await stripe.prices.retrieve(priceId!);
    const productId = price.product as string;
    const product = await stripe.products.retrieve(productId);
    const plan = product.name;

    // Update the user's subscription status and plan
    try {
      console.log('Updating user with stripeCustomerId:', customerId);

      const updatedUser = await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: 'active', // Payment completed
          subscriptionPlan: plan,
          subscriptionEndDate: null, // For one-time payments, you may set this to null or a specific date
        },
      });

      console.log(`User updated:`, updatedUser);
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.error(`User with stripeCustomerId ${customerId} not found.`);
        // Optionally, handle user not found (e.g., create a new user)
      } else {
        console.error('Error updating user subscription status:', error.message);
        throw error; // Rethrow to be caught in the main try-catch block
      }
    }
  } else if (session.mode === 'subscription'   && session.payment_status === 'paid') {
    const customerId = session.customer as string;
    // const paymentIntentId = session.payment_intent as string;

    // console.log('Retrieving payment intent with ID:', paymentIntentId);

    // // Retrieve the payment intent to get payment details
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Retrieve the product details from the line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price?.id;
    const price = await stripe.prices.retrieve(priceId!);
    const productId = price.product as string;
    const product = await stripe.products.retrieve(productId);
    const plan = product.name;

    // Update the user's subscription status and plan
    try {
      console.log('Updating user with stripeCustomerId:', customerId);

      const updatedUser = await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: 'active', // Payment completed
          subscriptionPlan: plan,
          subscriptionEndDate: null, // For one-time payments, you may set this to null or a specific date
        },
      });

      console.log(`User updated:`, updatedUser);
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.error(`User with stripeCustomerId ${customerId} not found.`);
        // Optionally, handle user not found (e.g., create a new user)
      } else {
        console.error('Error updating user subscription status:', error.message);
        throw error; // Rethrow to be caught in the main try-catch block
      }
    }
  } else {
    console.log('Checkout session is not in payment mode or payment not completed.');
  }
}



