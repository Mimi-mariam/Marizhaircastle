import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z.string().min(1, { message: "Variant is required." }),
  quantity: z
    .number()
    .int({ message: "Quantity must be a whole number." })
    .min(1, { message: "Quantity must be at least 1." })
    .max(99, { message: "Quantity is too large." }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int({ message: "Quantity must be a whole number." })
    .min(1, { message: "Quantity must be at least 1." })
    .max(99, { message: "Quantity is too large." }),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
