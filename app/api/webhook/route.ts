import { NextRequest, NextResponse } from "next/server";
import { stripe, getSubscriptionPeriodEnd } from "@/lib/stripe";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `Checkout completed: customer=${session.customer}, email=${session.customer_email}, subscription=${session.subscription}`
      );
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const periodEnd = getSubscriptionPeriodEnd(sub);
      console.log(
        `Subscription updated: id=${sub.id}, status=${sub.status}, customer=${sub.customer}, period_end=${periodEnd}`
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(
        `Subscription deleted: id=${sub.id}, customer=${sub.customer}`
      );
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
