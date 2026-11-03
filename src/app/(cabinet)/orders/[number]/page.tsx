import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailScreen } from "@/components/order-detail/order-detail-screen";

interface OrderPageProps {
  params: Promise<{ number: string }>;
}

/** Order numbers look like FR001383 or DRAFT-003; anything else can't exist. */
const ORDER_NUMBER = /^[A-Z0-9][A-Z0-9-]{0,19}$/;

function normalize(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toUpperCase();
  } catch {
    return raw.trim().toUpperCase();
  }
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const number = normalize((await params).number);
  return { title: ORDER_NUMBER.test(number) ? number : "Order not found" };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const number = normalize((await params).number);
  if (!ORDER_NUMBER.test(number)) notFound();
  return <OrderDetailScreen number={number} />;
}
