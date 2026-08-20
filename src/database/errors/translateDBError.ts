import type { DatabaseError } from "pg";
import { ApiError } from "@/exceptions/ApiError.js";

import { handleUniqueViolation } from "./handlers/handleUniqueViolation.js";
import { handleNotNullViolation } from "./handlers/handleNotNullViolation.js";

import { logDBError } from "./logDBError.js";

export function translateDBError(err: DatabaseError, resource: string) {
  switch (err.code) {
    case "23505":
      return handleUniqueViolation(err, resource);
    case "23502":
      return handleNotNullViolation(err, resource);
    case "23503": {
      logDBError(err);
      return ApiError.badRequest(
        `Bad request: related resource does not exist`,
      );
    }
    default: {
      console.log(err);
      return ApiError.internal("Internal: database error");
    }
  }
}
