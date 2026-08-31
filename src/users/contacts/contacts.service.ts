import { ApiError } from "@/exceptions/ApiError.js";
import { contactsRepository } from "./contacts.repository.js";
import { idSchema } from "../user.schema.js";
import { buildAvatarUrl } from "../avatar/build-avatar.js";

class ContactsService {
  async getContacts(userId: string) {
    const contacts = await contactsRepository.getContacts(userId);
    return contacts?.map((contact) => ({
      userId: contact.userId,
      name: contact.name,
      lastOnlineAt: contact.lastOnlineAt,
      avatar: contact.avatarId
        ? {
            avatarId: contact.avatarId,
            url: buildAvatarUrl(
              contact.avatarId,
              contact.transformations,
              "thumbnail",
            ),
          }
        : null,
    }));
  }

  async addContact(userId: string, contactId: string) {
    const validContactId = idSchema.parse(contactId);
    if (validContactId === userId) throw ApiError.badRequest();
    await contactsRepository.addContact(userId, validContactId);
  }

  async deleteContact(userId: string, contactId: string) {
    const validContactId = idSchema.parse(contactId);
    if (validContactId === userId) throw ApiError.badRequest();
    await contactsRepository.deleteContactById(userId, validContactId);
  }
}

const contactsService = new ContactsService();
export { contactsService };
