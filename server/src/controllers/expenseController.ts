import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

export const getExpensesByCategory = asyncHandler(async (_req, res) => {
  const raw = await prisma.expenseByCategory.findMany({
    orderBy: { date: "desc" },
  });
  res.json(raw.map((item) => ({ ...item, amount: item.amount.toString() })));
});
