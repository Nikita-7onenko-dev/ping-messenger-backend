import { sessionRepository } from "@/users/session/session.repository.js";

export async function deleteExpiredSessionsJob() {
  try {
    const deletedCount = await sessionRepository.deleteExpired();
    console.log(
      `[Job] deleteExpiredSessions: completed; sessions deleted: ${deletedCount}`,
    );
  } catch (err) {
    console.error("[Job] deleteExpiredSessions: failed", err);
  }
}
