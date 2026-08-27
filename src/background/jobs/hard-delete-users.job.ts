import { userRepository } from "@/users/user.repository.js";

export async function hardDeleteUsersJob() {
  try {
    const deletedCount = await userRepository.hardDelete();
    console.log(
      `[Job] hardDeleteUsers: completed; users deleted: ${deletedCount}`,
    );
  } catch (err) {
    console.error("[Job] hardDeleteUsers: failed", err);
  }
}
