export function isExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}
