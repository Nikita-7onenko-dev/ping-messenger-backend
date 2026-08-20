import type { DatabaseError } from "pg";
import { ApiError } from "../../../exceptions/ApiError.js";

export function handleNotNullViolation(err: DatabaseError, resource: string) {
  const field = err.column || "fields";
  return ApiError.badRequest(
    `Bad request: required ${resource} ${field} is missing`,
  );
}
