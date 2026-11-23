import { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not forward rejected promises to error middleware.
// Wrap async handlers so thrown errors reach the central error handler.
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
