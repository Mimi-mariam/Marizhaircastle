import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartForUser } from "@/lib/catalog/cart";
import { CheckoutView } from "@/components/storefront/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Marizhaircastle",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  let serverRows: Array<{
    variantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
  }> = [];

  if (user) {
    const cart = await getCartForUser(user.id);
    const items = cart?.items ?? [];
    serverRows = items.map((item) => ({
      variantId: item.variantId,
      productName: item.variant.product.name,
      variantName: item.variant.name,
      quantity: item.quantity,
      unitPrice: item.variant.product.price.toNumber(),
    }));
  }

  return (
    <CheckoutView
      user={user ? { name: user.name, email: user.email } : null}
      initialServerRows={serverRows}
    />
  );
}