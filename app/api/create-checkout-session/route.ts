// checkout.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from "@/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Define allowed plans for each role using the exact slugs from your PLANS array
const ALLOWED_PLANS: Record<string, string[]> = {
  USER: ['comprehensive insights'],
  FACILITY: ['health tracker'],
  // Add other roles and their allowed plans as needed
};

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Retrieve the price and associated product from Stripe
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product as string);

    // Use the product name converted to lowercase as the plan slug
  
  

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
      });
      stripeCustomerId = customer.id;

      // Save the Stripe customer ID to the user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    if (user.role === 'USER'){

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
    });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'pending', // Will be updated by webhook
        subscriptionPlan: product.name,
        // Note: subscriptionEndDate will be set by the webhook when the subscription is confirmed
      },
    });

    console.log('User updated with initial subscription details:', updatedUser);

    return NextResponse.json({ sessionId: checkoutSession.id });



    } else if (user.role === "FACILITY") {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/facility/dashboard`,
        cancel_url: `${req.headers.get('origin')}/pricing`,
      });
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'pending', // Will be updated by webhook
          subscriptionPlan: product.name,
          // Note: subscriptionEndDate will be set by the webhook when the subscription is confirmed
        },
      });
  
      console.log('User updated with initial subscription details:', updatedUser);
  
      return NextResponse.json({ sessionId: checkoutSession.id });
    }

    // Update user with initial subscription details
    
  } catch (err: any) {
    console.error('Error during checkout process:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
