import type { DatabaseError } from "pg";

export function logDBError(err: DatabaseError) {
  console.log({
    code: err.code,
    constraint: err.constraint,
    column: err.column,
    table: err.table,
    detail: err.detail,
    message: err.message,
  });
}
