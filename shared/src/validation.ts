import type { z } from "zod";

/** Field path -> list of messages, e.g. { price: ["Price must be 0 or more"] }. */
export type FieldErrors = Record<string, string[]>;

/** Body of a 400 response produced by failed validation. */
export interface ValidationErrorBody {
  message: string;
  details: { fieldErrors: FieldErrors };
}

/** Turn Zod issues into a flat field -> messages map. Root-level issues use the key "_root". */
export const toFieldErrors = (issues: z.core.$ZodIssue[]): FieldErrors => {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.length ? issue.path.map(String).join(".") : "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
};
