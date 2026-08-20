import type { DatabaseError } from "pg";

export function logDBError(err: DatabaseError) {
  console.error({
    code: err.code,
    constraint: err.constraint,
    column: err.column,
    table: err.table,
    detail: err.detail,
    message: err.message,
  });
}
