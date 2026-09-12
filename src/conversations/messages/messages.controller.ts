import type { Request, Response } from "express";
import { createMessageSchema } from "./messages.schema.js";
import { messageService } from "./messages.service.js";

class MessagesController {
  async send(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const payload = createMessageSchema.parse(req.body);
    if ("participantId" in payload) {
      await messageService.sendPrivateMessage(userId, payload);
    } else {
    }
    res.sendStatus(204);
  }

  async update(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const { messageId } = req.params;
    const { content } = req.body;
    const message = await messageService.update(userId, {
      messageId,
      content,
    });
    res.status(200).json(message);
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const { messageId } = req.params;
    await messageService.delete(userId, messageId);

    res.sendStatus(204);
  }
}

const messagesController = new MessagesController();
export { messagesController };
