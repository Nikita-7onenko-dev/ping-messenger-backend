import { DatabaseError } from "pg";
import { ApiError } from "@/exceptions/ApiError.js";

import { handleUniqueViolation } from "./handlers/handleUniqueViolation.js";
import { handleNotNullViolation } from "./handlers/handleNotNullViolation.js";
import { logDBError } from "./logDBError.js";

export function translateDBError(err: unknown, resource: string) {
  if (!(err instanceof DatabaseError)) throw err;

  switch (err.code) {
    case "23505":
      return handleUniqueViolation(err, resource);
    case "23502":
      return handleNotNullViolation(err, resource);
    case "23503": {
      logDBError(err);
      return ApiError.badRequest(
        `Bad request: related ${resource} does not exist`,
      );
    }
    default: {
      logDBError(err);
      return ApiError.internal("Internal: database error");
    }
  }
}
