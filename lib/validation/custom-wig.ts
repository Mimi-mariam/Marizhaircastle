import { z } from "zod";

export const WIG_TYPES = ["Closure", "Frontal"] as const;

export const LACE_SIZE_OPTIONS = [
  "5x5 HD Closure",
  "6x6 HD Closure",
  "7x7 HD Closure",
  "9x6 HD Closure",
  "13x6 HD Frontal",
] as const;

export const BUNDLE_OPTIONS = [
  "2 bundles (200g)",
  "3 bundles (300g)",
  "4 bundles (400g)",
  "5 bundles (500g)",
  "6 bundles (600g)",
] as const;

export const CAP_SIZE_OPTIONS = [
  "Small",
  "Medium",
  "Large",
  "Custom Measurement",
] as const;

export const LENGTH_OPTIONS = [
  '14"',
  '16"',
  '18"',
  '20"',
  '22"',
  '24"',
  '26"',
  "28\"",
  "30\"",
] as const;

export const customWigRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "First name is required." })
    .max(100, { message: "Name is too long." }),
  email: z
    .email({ message: "Enter a valid email address." })
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid phone number." })
    .max(20, { message: "Phone number is too long." }),
  wigType: z.enum(WIG_TYPES, { message: "Select a wig type." }),
  laceSize: z.enum(LACE_SIZE_OPTIONS, { message: "Select a lace size." }),
  bundles: z.enum(BUNDLE_OPTIONS, { message: "Select a bundle amount." }),
  capSize: z.enum(CAP_SIZE_OPTIONS, { message: "Select a cap size." }),
  length: z.string().trim().max(20).optional(),
  styleInspoUrl: z
    .string()
    .url({ message: "Style inspiration photo is required." }),
  colorInspoUrl: z
    .string()
    .url({ message: "Color inspiration photo is required." }),
  notes: z.string().trim().max(2000).optional(),
});

export type CustomWigRequestInput = z.infer<typeof customWigRequestSchema>;