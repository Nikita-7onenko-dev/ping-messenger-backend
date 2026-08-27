import { oneTimeTokenRepository } from "@/one-time-token/one-time-token.repository.js";

export async function deleteExpiredTokensJob() {
  try {
    const deletedCount = await oneTimeTokenRepository.deleteExpired();
    console.log(
      `[Job] deleteExpiredTokens: completed; tokens deleted: ${deletedCount}`,
    );
  } catch (err) {
    console.error("[Job] deleteExpiredTokens: failed", err);
  }
}
