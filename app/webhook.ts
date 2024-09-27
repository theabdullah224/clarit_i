// webhook.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from "@/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Error verifying webhook signature:', err);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await updateUserSubscriptionStatus(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: `Webhook processing error: ${err.message}` }, { status: 500 });
  }
}

async function updateUserSubscriptionStatus(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const price = subscription.items.data[0].price;
  const productId = price.product as string;
  const product = await stripe.products.retrieve(productId);
  const plan = product.name;
  const endDate = new Date(subscription.current_period_end * 1000);

  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: status,
          subscriptionPlan: plan,
          subscriptionEndDate: endDate,
        },
      });
    }
  }
    
    catch (error) {
    console.error('Error updating user subscription status:', error);
    throw error; // Rethrow the error to be caught in the main try-catch block
  }
}

