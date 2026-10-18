import AppShell from "./AppShell";
import { CartProvider } from "./CartProvider";
import { AuthProvider } from "./AuthProvider";

// The store frame: sign-in state, cart, navbar and footer.
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <AppShell>{children}</AppShell>
      </CartProvider>
    </AuthProvider>
  );
}
