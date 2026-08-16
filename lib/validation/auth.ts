import { z } from "zod";

const email = z.email({ message: "Enter a valid email address." });
const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .max(128, { message: "Password must be at most 128 characters." });
const name = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters." })
  .max(80, { message: "Name must be at most 80 characters." });

export const registerSchema = z.object({
  name,
  email: email.transform((v) => v.toLowerCase()),
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: email.transform((v) => v.toLowerCase()),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
