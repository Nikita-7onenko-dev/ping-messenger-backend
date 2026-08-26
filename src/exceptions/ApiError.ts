import type { ApiErrorCode } from "./API_ERROR_CODES.type.js";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super();
    this.code = code;
    this.status = status;
  }

  static badRequest(code: ApiErrorCode = "BAD_REQUEST") {
    return new ApiError(400, code);
  }

  static unauthorized(code: ApiErrorCode = "UNAUTHORIZED") {
    return new ApiError(401, code);
  }

  static forbidden(code: ApiErrorCode = "FORBIDDEN") {
    return new ApiError(403, code);
  }

  static notFound(code: ApiErrorCode = "NOT_FOUND") {
    return new ApiError(404, code);
  }

  static conflict(code: ApiErrorCode = "CONFLICT") {
    return new ApiError(409, code);
  }

  static internal(message: string = "INTERNAL_SERVER_ERROR") {
    return new ApiError(500, message);
  }

  static serviceUnavailable(code: ApiErrorCode = "SERVICE_UNAVAILABLE") {
    return new ApiError(503, code);
  }
}
