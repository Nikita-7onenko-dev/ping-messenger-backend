import { ApiError } from "@/exceptions/ApiError.js";

export const userConstraints: Record<string, () => ApiError> = {
  users_email_unique_idx: () => ApiError.conflict("USER_EMAIL_ALREADY_EXISTS"),
  users_username_unique_idx: () =>
    ApiError.conflict("USER_USERNAME_ALREADY_EXISTS"),
};
