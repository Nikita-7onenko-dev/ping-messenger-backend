import type { Request } from "express";
import type { MessageCursor } from "./messages.types.js";
import { cursorQuerySchema, cursorSchema } from "./messages.schema.js";

export function cursorParser(req: Request): MessageCursor | undefined {
  const { cursor } = req.query;
  const cursorJSON = cursorQuerySchema.parse(cursor);
  if (cursorJSON) {
    const parsedCursor = JSON.parse(cursorJSON);
    return cursorSchema.parse(parsedCursor);
  }
}
