import { Router } from "express";
import { createProductSchema, productQuerySchema } from "@inventory/shared";
import { getProducts, createProduct } from "../controllers/productController";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", validate({ query: productQuerySchema }), getProducts);
router.post("/", validate({ body: createProductSchema }), createProduct);

export default router;
