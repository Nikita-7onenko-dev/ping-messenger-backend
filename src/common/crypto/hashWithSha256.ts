import { createHash } from "node:crypto";

export function hashWithSha256(token: string) {
  return createHash("SHA256").update(token).digest("hex");
}
