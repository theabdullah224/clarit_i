// webhook.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

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
}

async function updateUserSubscriptionStatus(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const plan = (subscription.items.data[0].price.product as Stripe.Product).name;
  const endDate = new Date(subscription.current_period_end * 1000);

  try {
    await prisma.user.update({
      where: { stripeCustomerId: customerId },
      data: {
        subscriptionStatus: status,
        subscriptionPlan: plan,
        subscriptionEndDate: endDate,
      },
    });
    console.log(`Updated subscription for customer: ${customerId}`);
  } catch (error) {
    console.error('Error updating user subscription status:', error);
  }
}