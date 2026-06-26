import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1519793914582663390/4_qUxxFHj9ZgWGpTROoczFCog9sWkKEr3lnmLz3Dm-gTOpyLeQqcvrLzXPM_A9XJAgRI";

async function sendDiscordNotification(title: string, price: number, method: string) {
  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "🛒 Νέα Αγορά!",
        color: 0xFFD700,
        fields: [
          { name: "Resource", value: title, inline: true },
          { name: "Τιμή", value: `${price}€`, inline: true },
          { name: "Μέθοδος", value: method, inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const { resourceId } = await req.json();

  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.is_free) {
    return NextResponse.json({ error: "This resource is free" }, { status: 400 });
  }

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: resource.title },
          unit_amount: Math.round(resource.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.nextUrl.origin}/success?resource_id=${resource.id}`,
    cancel_url: `${req.nextUrl.origin}/`,
    metadata: { resourceId: resource.id },
  });

  await sendDiscordNotification(resource.title, resource.price, "Stripe");

  return NextResponse.json({ url: session.url });
}
