import type { Metadata } from "next";
import OrderConfirmation from "./OrderConfirmation";

export const metadata: Metadata = {
  title: "Order placed — Vega",
};

export default function OrderPlacedPage() {
  return <OrderConfirmation />;
}
