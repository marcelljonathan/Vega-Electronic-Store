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

// How an order is paid. New orders use Midtrans (which offers cards, virtual
// accounts, QRIS and e-wallets); the others label older demo orders.
export const paymentOptions = [
  { id: "midtrans", label: "Midtrans" },
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

export type AddressErrors = Partial<Record<keyof Address, string>>;

// Checks a shipping address — used by the checkout form and again on the
// server before an order is saved. An empty object means it's valid.
export function validateAddress(a: Address): AddressErrors {
  const errors: AddressErrors = {};
  if (!a.fullName.trim()) errors.fullName = "Please enter the recipient's name.";
  if (!isValidPhone(a.phone))
    errors.phone = "Please enter a valid mobile number, e.g. 812 3456 7890.";
  if (a.street.trim().length < 5)
    errors.street = "Please enter the full street address.";
  if (!provinces.includes(a.province)) errors.province = "Please choose a province.";
  if (!a.city.trim()) errors.city = "Please enter the city or regency.";
  if (!a.district.trim()) errors.district = "Please enter the district.";
  if (!/^\d{5}$/.test(a.postalCode.trim()))
    errors.postalCode = "Postal codes have 5 digits.";
  return errors;
}

// The address as it's saved: trimmed, phone as digits after +62.
export function cleanAddress(a: Address): Address {
  return {
    fullName: a.fullName.trim(),
    phone: normalizePhone(a.phone),
    street: a.street.trim(),
    province: a.province,
    city: a.city.trim(),
    district: a.district.trim(),
    postalCode: a.postalCode.trim(),
  };
}
