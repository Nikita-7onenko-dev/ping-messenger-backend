import { randomBytes } from "node:crypto";

export function generateRandomToken() {
  return randomBytes(32).toString("hex");
}
