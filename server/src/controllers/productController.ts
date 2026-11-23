import { randomUUID } from "crypto";
import type { CreateProductInput, ProductQuery } from "@inventory/shared";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

// Request data below has already been checked by the validate() middleware.

export const getProducts = asyncHandler(async (req, res) => {
  const { search } = req.query as ProductQuery;
  const products = await prisma.products.findMany({
    where: search ? { name: { contains: search } } : undefined,
  });
  res.json(products);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { productId, name, price, rating, stockQuantity } =
    req.body as CreateProductInput;
  const product = await prisma.products.create({
    data: {
      productId: productId ?? randomUUID(),
      name,
      price,
      rating,
      stockQuantity,
    },
  });
  res.status(201).json(product);
});
