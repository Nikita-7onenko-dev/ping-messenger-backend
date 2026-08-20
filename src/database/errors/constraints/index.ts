import type { ApiError } from "@/exceptions/ApiError.js";
import { userConstraints } from "./users.js";

export const constraintMap: Record<string, () => ApiError> = {
  ...userConstraints,
};
