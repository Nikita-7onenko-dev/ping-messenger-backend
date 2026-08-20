export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }

  static badRequest(message = "Bad Request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message = "Service unavailable") {
    return new ApiError(503, message);
  }
}
