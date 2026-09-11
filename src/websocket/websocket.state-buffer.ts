import { messagesRepository } from "@/conversations/messages/messages.repository.js";
import type { ReadAtPayload } from "@/conversations/messages/messages.types.js";

class StateBuffer {
  private messageReadAtState: ReadAtPayload[] = [];
  private isFlushing = false;

  private async flushAll() {
    const payload = [...this.messageReadAtState];
    this.messageReadAtState = [];
    if (!payload.length) return;

    try {
      console.log("flushing state");
      await messagesRepository.markMessagesAsRead(payload);
    } catch (err) {
      console.error(`Failed to flush message read at state ${err}`);
      this.messageReadAtState.push(...payload);
    }
  }

  startFlushHeartbeat() {
    console.log("WS state-buffer heartbeat started");

    setInterval(async () => {
      if (this.isFlushing) return;

      this.isFlushing = true;
      try {
        await this.flushAll();
      } finally {
        this.isFlushing = false;
      }
    }, 5_000);
  }

  accumulate(payload: ReadAtPayload) {
    this.messageReadAtState.push(payload);
  }
}

const stateBuffer = new StateBuffer();
export { stateBuffer };
