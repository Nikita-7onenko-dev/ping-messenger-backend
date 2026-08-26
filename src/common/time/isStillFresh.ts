export function isStillFresh(expiresAt: Date) {
  expiresAt.getTime() - Date.now() > 5 * 60 * 1000;
}
