import { z } from "zod";

export const deliveryInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name is required." })
    .max(100, { message: "Name is too long." }),
  email: z.email({ message: "Enter a valid email address." }).transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid phone number." })
    .max(20, { message: "Phone number is too long." }),
  address: z
    .string()
    .trim()
    .min(5, { message: "Enter a valid delivery address." })
    .max(500, { message: "Address is too long." }),
  location: z.string().trim().max(200).optional(),
  deliveryZone: z.enum(["lagos_island", "lagos_mainland", "interstate"]).default("lagos_island"),
  guestItems: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .optional(),
});

export type DeliveryInfoInput = z.infer<typeof deliveryInfoSchema>;

