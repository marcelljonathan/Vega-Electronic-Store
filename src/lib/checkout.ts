import type { CartItem } from "@/app/CartProvider";

// All 38 Indonesian provinces, for the shipping address dropdown.
export const provinces = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
];

export const deliveryOptions = [
  { id: "standard", label: "Standard", time: "3–5 business days", fee: 0 },
  { id: "express", label: "Express", time: "1–2 business days", fee: 50_000 },
] as const;

export const paymentOptions = [
  { id: "card", label: "Credit or debit card" },
  { id: "bank", label: "Bank transfer" },
  { id: "ewallet", label: "E-wallet" },
] as const;

export type DeliveryId = (typeof deliveryOptions)[number]["id"];
export type PaymentId = (typeof paymentOptions)[number]["id"];

export type Address = {
  fullName: string;
  phone: string; // digits after +62, e.g. "81234567890"
  street: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
};

export type Order = {
  number: string;
  placedAt: string;
  email: string;
  address: Address;
  delivery: DeliveryId;
  payment: PaymentId;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
};

// Accepts "0812…", "812…", "+62 812…" or "62812…" and returns just the
// digits after +62 ("812…"), which is how Indonesian mobile numbers are stored.
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

// A mobile number after +62 starts with 8 and has 9–12 digits.
export function isValidPhone(input: string) {
  return /^8\d{8,11}$/.test(normalizePhone(input));
}

// Until the backend exists, the last placed order lives in this tab's
// sessionStorage so the confirmation page can show it.
export const LAST_ORDER_KEY = "vega-last-order";

// A short, readable demo order number like "VG-48213".
export function createOrderNumber() {
  return `VG-${Math.floor(10000 + Math.random() * 90000)}`;
}
