import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartForUser } from "@/lib/catalog/cart";
import { CartView } from "@/components/storefront/CartView";

export const metadata: Metadata = {
  title: "Your Cart | Marizhaircastle",
};

export default async function CartPage() {
  const user = await getCurrentUser();
  let serverRows: Array<{
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    variantName: string;
    image: { url: string; alt: string } | null;
    unitPrice: number;
    quantity: number;
    stock: number;
    unavailable: boolean;
  }> = [];

  if (user) {
    const cart = await getCartForUser(user.id);
    const items = cart?.items ?? [];
    serverRows = items.map((item) => {
      const product = item.variant.product;
      const price = product.price.toNumber();
      const unavailable =
        !product.active || product.archived || (item.variant.inventory?.stock ?? 0) <= 0;
      return {
        id: item.id,
        variantId: item.variantId,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: item.variant.name,
        image: product.images[0] ?? null,
        unitPrice: price,
        quantity: item.quantity,
        stock: item.variant.inventory?.stock ?? 0,
        unavailable,
      };
    });
  }

  return <CartView initialServerRows={serverRows} />;
}