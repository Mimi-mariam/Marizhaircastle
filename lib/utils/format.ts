import type { Decimal } from "@prisma/client/runtime/client";

export function formatNaira(amount: number | Decimal): string {
  const value = typeof amount === "number" ? amount : amount.toNumber();
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}
