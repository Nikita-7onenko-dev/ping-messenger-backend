import type { Request, Response } from "express";
import { contactsService } from "./contacts.service.js";
import { idSchema } from "../user.schema.js";

class ContactsController {
  async getContacts(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const contacts = await contactsService.getContacts(userId);
    res.status(200).json(contacts);
  }

  async addContact(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const contactId = idSchema.parse(req.params.contactId);
    await contactsService.addContact(userId, contactId);
    res.sendStatus(204);
  }

  async deleteContact(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const contactId = idSchema.parse(req.params.contactId);

    await contactsService.deleteContact(userId, contactId);
    res.sendStatus(204);
  }
}

const contactsController = new ContactsController();
export { contactsController };
