import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

export const getDashboardMetrics = asyncHandler(async (_req, res) => {
  const [
    popularProducts,
    salesSummary,
    purchaseSummary,
    expenseSummary,
    expenseByCategoryRaw,
  ] = await Promise.all([
    prisma.products.findMany({ take: 15, orderBy: { stockQuantity: "desc" } }),
    prisma.salesSummary.findMany({ take: 5, orderBy: { date: "desc" } }),
    prisma.purchaseSummary.findMany({ take: 15, orderBy: { date: "desc" } }),
    prisma.expenseSummary.findMany({ take: 5, orderBy: { date: "desc" } }),
    prisma.expenseByCategory.findMany({ take: 5, orderBy: { date: "desc" } }),
  ]);

  const expenseByCategorySummary = expenseByCategoryRaw.map((item) => ({
    ...item,
    amount: item.amount.toString(),
  }));

  res.json({
    popularProducts,
    salesSummary,
    purchaseSummary,
    expenseSummary,
    expenseByCategorySummary,
  });
});
