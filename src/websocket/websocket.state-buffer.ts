import { messagesRepository } from "@/conversations/messages/messages.repository.js";
import type { ReadAtPayload } from "@/conversations/messages/messages.types.js";

class StateBuffer {
  private messageReadAtState = new Map<string, ReadAtPayload[]>();
  accumulate(userId: string, payload: ReadAtPayload) {
    const readAtPayload = this.messageReadAtState.get(userId) ?? [];
    readAtPayload.push(payload);
    this.messageReadAtState.set(userId, readAtPayload);
  }

  async flush(userId: string) {
    const payload = this.messageReadAtState.get(userId);
    if (!payload) return;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await messagesRepository.markMessagesAsRead(userId, payload);

        this.messageReadAtState.delete(userId);
        return;
      } catch (err) {
        if (attempt === 3)
          console.error(`Failed to flush message read at state ${err}`);
      }
    }
  }
}

const stateBuffer = new StateBuffer();
export { stateBuffer };
