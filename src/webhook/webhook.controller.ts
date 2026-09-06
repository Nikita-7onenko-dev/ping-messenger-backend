import { avatarService } from "@/users/avatar/avatar.service.js";
import type { Request, Response } from "express";

class WebhookController {
  async confirmUpload(req: Request, res: Response) {
    await avatarService.confirmUpload(req.body);
    res.sendStatus(200);
  }
}

const webhookController = new WebhookController();
export { webhookController };
