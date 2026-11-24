import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.users.findMany();
  res.json(users);
});
