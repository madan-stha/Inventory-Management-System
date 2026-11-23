import { RequestHandler } from "express";
import type { ZodType } from "zod";
import { toFieldErrors } from "@inventory/shared";
import { HttpError } from "../lib/httpError";

type Schemas = { body?: ZodType; query?: ZodType };

/**
 * Validate req.body / req.query against Zod schemas. On success the parsed
 * (trimmed, typed) values replace the originals; on failure the request ends
 * with a 400 listing the errors for each field.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    const issues = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {});
      if (result.success) req.body = result.data;
      else issues.push(...result.error.issues);
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) req.query = result.data as typeof req.query;
      else issues.push(...result.error.issues);
    }

    if (issues.length) {
      return next(
        new HttpError(400, "Validation failed", {
          fieldErrors: toFieldErrors(issues),
        })
      );
    }
    next();
  };
