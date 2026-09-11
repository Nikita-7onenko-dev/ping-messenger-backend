import { messagesRepository } from "@/conversations/messages/messages.repository.js";
import type { ReadAtPayload } from "@/conversations/messages/messages.types.js";

class StateBuffer {
  private messageReadAtState: ReadAtPayload[] = [];
  private isFlushing = false;
  private heartbeatTimerId: NodeJS.Timeout | null = null;

  async flush() {
    const payload = [...this.messageReadAtState];
    this.messageReadAtState = [];
    if (!payload.length) return;

    try {
      console.log("flushing state");
      await messagesRepository.markMessagesAsRead(payload);
    } catch (err) {
      this.messageReadAtState.push(...payload);
      throw err;
    }
  }

  startFlushHeartbeat() {
    if (this.heartbeatTimerId) return;

    console.log("WS state-buffer heartbeat started");

    this.heartbeatTimerId = setInterval(async () => {
      if (this.isFlushing) return;

      this.isFlushing = true;
      try {
        await this.flush();
      } catch (err) {
        console.error(`Failed to flush message read at state ${err}`);
      } finally {
        this.isFlushing = false;
      }
    }, 5_000);
  }

  stopHeartbeat() {
    if (!this.heartbeatTimerId) return;
    clearInterval(this.heartbeatTimerId);
  }

  accumulate(payload: ReadAtPayload) {
    this.messageReadAtState.push(payload);
  }
}

const stateBuffer = new StateBuffer();
export { stateBuffer };
