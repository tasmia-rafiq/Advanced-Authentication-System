import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long").trim(),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be least 8 characters long")
    .regex(/[A-Z]/, "Uppercase required")
    .regex(/[0-9]/, "Number required")
    .regex(/[^A-Za-z0-9]/, "Special char required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be least 8 characters long"),
});