import { ApiError } from "@/exceptions/ApiError.js";

export const requireStringParam = (
  param: string | string[] | undefined,
): string => {
  if (!param) {
    throw ApiError.badRequest("MISSING_PARAMETER");
  }

  if (Array.isArray(param)) {
    throw ApiError.badRequest("INVALID_PARAMETER_FORMAT");
  }

  return param;
};
