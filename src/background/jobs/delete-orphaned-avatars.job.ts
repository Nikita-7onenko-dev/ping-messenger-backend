import cloudinary from "@/config/cloudinary.js";
import { avatarRepository } from "@/users/avatar/avatar.repository.js";

export async function deleteOrphanedAvatars() {
  const avatars = await avatarRepository.getUnconfirmed();
  let avatarsDeleted = 0;
  let errorsCount = 0;
  for (const { avatarId } of avatars) {
    try {
      await cloudinary.api.resource(`Ping/avatars/${avatarId}`, {
        resource_type: "image",
        type: "upload",
      });
    } catch (err) {
      const httpCode =
        typeof err === "object" &&
        err !== null &&
        "http_code" in err &&
        typeof err.http_code === "number"
          ? err.http_code
          : undefined;

      if (httpCode === 404) {
        await avatarRepository.schedulerDelete(avatarId);
        avatarsDeleted++;
      } else {
        errorsCount++;
        console.error(err);
      }
    }
  }
  console.log(
    `[Job] deleteOrphanedAvatars: completed; avatars deleted: ${avatarsDeleted}, errors: ${errorsCount}`,
  );
}
