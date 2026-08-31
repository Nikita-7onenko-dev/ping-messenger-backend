import { avatarDestroy } from "@/users/avatar/avatar.destroy.js";
import { avatarRepository } from "@/users/avatar/avatar.repository.js";

export async function cleanupDeletedUserAvatars() {
  const deletedUserAvatars = await avatarRepository.getAvatarsOfDeletedUsers();
  let avatarsDeleted = 0;
  let errorsCount = 0;
  for (const { userId, avatarId } of deletedUserAvatars) {
    try {
      const publicId = `Ping/avatars/${avatarId}`;
      await avatarDestroy(publicId);

      await avatarRepository.delete(userId, avatarId);
      avatarsDeleted++;
    } catch (err) {
      errorsCount++;
      console.error(err);
    }
  }

  console.log(
    `[Job] cleanupDeletedUserAvatars: completed; avatars deleted: ${avatarsDeleted}, errors: ${errorsCount}`,
  );
}
