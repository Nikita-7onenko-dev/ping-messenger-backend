import type { Request, Response } from "express";
import { conversationsService } from "./conversations.service.js";

class ConversationsController {
  async getConversations(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const conversations = await conversationsService.getConversations(userId);
    res.status(200).json(conversations);
  }
}

const conversationsController = new ConversationsController();
export { conversationsController };
