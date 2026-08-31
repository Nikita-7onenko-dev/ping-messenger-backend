import type { Request, Response } from "express";
import { sessionService } from "./session.service.js";

class SessionController {
  async getMySessions(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware
    const sessionId = req.sessionId!; // check in middleware

    const sessions = await sessionService.getAll(id, sessionId);
    res.status(200).json(sessions);
  }

  async endAllSessionsExceptCurrent(req: Request, res: Response) {
    const { userId, sessionId } = req; // checked in middleware
    await sessionService.endAllExceptCurrent(sessionId!, userId!);
    res.sendStatus(204);
  }

  async endSessionById(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const sessionId = req.sessionId!; // checked in middleware

    await sessionService.endById(sessionId, userId);
    res.sendStatus(204);
  }
}

const sessionController = new SessionController();
export { sessionController };
