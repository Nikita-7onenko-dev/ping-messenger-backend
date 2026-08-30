import { ApiError } from "@/exceptions/ApiError.js";
import { BrevoError } from "@getbrevo/brevo";

export function mailErrorHandler(err: unknown) {
  console.error(err);
  if (err instanceof BrevoError) {
    const statusCode = err.statusCode;

    if (
      statusCode === undefined ||
      statusCode === 408 ||
      statusCode === 429 ||
      statusCode >= 500
    ) {
      return ApiError.serviceUnavailable("MAIL_SERVICE_UNAVAILABLE");
    }

    return ApiError.internal();
  }

  return ApiError.serviceUnavailable("MAIL_SERVICE_UNAVAILABLE");
}
