import type { DatabaseError } from "pg";
import { ApiError } from "@/exceptions/ApiError.js";
import { logDBError } from "../logDBError.js";

export function handleNotNullViolation(err: DatabaseError, resource: string) {
  const field = err.column || "fields";
  logDBError(err, `Bad request: required ${resource} ${field} is missing`);
  return ApiError.internal();
}
