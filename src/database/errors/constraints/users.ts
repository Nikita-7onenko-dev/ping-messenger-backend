import { ApiError } from "@/exceptions/ApiError.js";

export const userConstraints: Record<string, () => ApiError> = {
  users_email_unique_idx: () =>
    ApiError.conflict("Conflict: user with this email already exists"),
  users_username_unique_idx: () =>
    ApiError.conflict("Conflict: user with this username already exists"),
};
