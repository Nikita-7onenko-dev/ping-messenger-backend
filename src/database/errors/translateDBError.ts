import { DatabaseError } from "pg";
import { ApiError } from "@/exceptions/ApiError.js";

import { handleUniqueViolation } from "./handlers/handleUniqueViolation.js";
import { handleNotNullViolation } from "./handlers/handleNotNullViolation.js";
import { logDBError } from "./logDBError.js";

export function translateDBError(err: unknown, resource: string) {
  if (!(err instanceof DatabaseError)) return err;

  switch (err.code) {
    case "23505":
      return handleUniqueViolation(err, resource);
    case "23502":
      return handleNotNullViolation(err, resource);
    case "23503": {
      logDBError(err, "Foreign-key violation");
      return ApiError.internal();
    }
    case "23514": {
      logDBError(err, "Check constraint violation");
      return ApiError.internal();
    }
    default: {
      logDBError(err, "Uncaught");
      return ApiError.internal();
    }
  }
}
