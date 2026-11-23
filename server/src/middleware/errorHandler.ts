import { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/httpError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

type ErrorBody = { message: string; details?: unknown };

const toHttp = (err: unknown): { status: number; body: ErrorBody } => {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      body: { message: err.message, details: err.details },
    };
  }

  // Malformed JSON body, raised by express.json()
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    return { status: 400, body: { message: "Malformed JSON in request body" } };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return {
          status: 409,
          body: {
            message: "A record with this value already exists",
            details: { fields: err.meta?.target },
          },
        };
      case "P2025":
        return { status: 404, body: { message: "Record not found" } };
      case "P2003":
        return {
          status: 400,
          body: { message: "Related record does not exist" },
        };
    }
  }

  // Wrong or missing field types reaching Prisma. Replaced by Zod validation later.
  if (err instanceof Prisma.PrismaClientValidationError) {
    return { status: 400, body: { message: "Invalid request data" } };
  }

  return { status: 500, body: { message: "Internal server error" } };
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { status, body } = toHttp(err);
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }
  res.status(status).json(body);
};
