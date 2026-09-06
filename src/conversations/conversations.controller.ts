import type { Request, Response } from "express";
import { conversationsService } from "./conversations.service.js";
import { cursorParser } from "./messages/messages.cursor.js";

class ConversationsController {
  async getConversations(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const conversations = await conversationsService.getConversations(userId);
    res.status(200).json(conversations);
  }

  async getHistory(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const cursor = cursorParser(req);

    const history = await conversationsService.getHistory(
      userId,
      req.params.conversationId,
      cursor,
    );
    res.status(200).json(history);
  }
}

const conversationsController = new ConversationsController();
export { conversationsController };
