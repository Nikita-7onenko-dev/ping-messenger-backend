import type { DatabaseError } from "pg";

export function logDBError(err: DatabaseError, customMessage?: string) {
  console.error({
    customMessage: customMessage,
    code: err.code,
    constraint: err.constraint,
    column: err.column,
    table: err.table,
    detail: err.detail,
    message: err.message,
  });
}
