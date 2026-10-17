// Prices are stored in whole Rupiah and shown the Indonesian way: Rp 14.399.000
export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
