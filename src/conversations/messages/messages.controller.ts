import type { Request, Response } from "express";
import { createMessageSchema } from "./messages.schema.js";
import { messageService } from "./messages.service.js";

class MessagesController {
  async sendMessage(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const payload = createMessageSchema.parse(req.body);
    if ("participantId" in payload) {
      await messageService.sendPrivateMessage(userId, payload);
    } else {
    }
    res.sendStatus(204);
  }
}

const messagesController = new MessagesController();
export { messagesController };
