import { z } from "zod";

export const createProductSchema = z.object({
  // Optional: the server generates one when omitted.
  productId: z.string().trim().min(1).max(64).optional(),
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price must be 0 or more")
    .max(1_000_000, "Price must be 1,000,000 or less"),
  stockQuantity: z
    .number({ error: "Stock quantity must be a number" })
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity must be 0 or more"),
  rating: z
    .number({ error: "Rating must be a number" })
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productQuerySchema = z.object({
  search: z
    .string({ error: "search must be a single string" })
    .trim()
    .max(100, "search must be 100 characters or fewer")
    .optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
