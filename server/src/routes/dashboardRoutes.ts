import { Router } from "express";
import { getDashboardMetrics } from "../controllers/darhboardController";

const router = Router();

router.get("/", getDashboardMetrics);

export default router;
