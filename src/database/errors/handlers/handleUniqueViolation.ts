import type { DatabaseError } from "pg";
import { ApiError } from "@/exceptions/ApiError.js";
import { constraintMap } from "../constraints/index.js";
import { logDBError } from "../logDBError.js";

export function handleUniqueViolation(err: DatabaseError, resource: string) {
  const handler = err.constraint && constraintMap[err.constraint];
  if (!handler) {
    logDBError(err, `${resource} unique constraint violation`);
    return ApiError.conflict();
  }

  const error = handler();
  return error;
}
