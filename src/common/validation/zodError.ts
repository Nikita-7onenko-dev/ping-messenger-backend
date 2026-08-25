import type { ApiErrorCode } from "@/exceptions/API_ERROR_CODES.type.js";

export const zodError = (code: ApiErrorCode) => ({ error: code });
