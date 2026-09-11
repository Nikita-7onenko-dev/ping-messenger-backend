import type { Server } from "ws";
import http from "node:http";
import WebSocket from "ws";

import { pool } from "./database/database.config.js";
import { wsConnectionService } from "./websocket/websocket.connection.service.js";
import { stateBuffer } from "./websocket/websocket.state-buffer.js";
import { scheduler } from "node:timers/promises";
import { stopScheduler } from "./background/scheduler.js";

export async function serverShutdown(
  wss: Server<typeof WebSocket, typeof http.IncomingMessage>,
  server: http.Server,
) {
  console.log("Shutting down server...");

  stopScheduler();

  wsConnectionService.stopHeartbeat();
  stateBuffer.stopHeartbeat();

  wsConnectionService.closeAll();
  wss.close();

  await new Promise<void>((res, rej) => {
    try {
      server.close((err) => {
        if (err) {
          rej(err);
          return;
        }
        res();
        console.log("Http server shut down successfully");
      });
    } catch (err) {
      console.error(`Failed to close HTTP server: ${err}`);
    }
  });

  try {
    await stateBuffer.flush();
  } catch (err) {
    console.log("Sorry, bruh, shit happens");
    console.error(`Failed to flush state during shutdown: ${err}`);
  }

  try {
    await pool.end();
  } catch (err) {
    console.log("Goddammit, Houston, we got a problem!");
    console.error(`Failed to close db pool: ${err}`);
  }

  console.log("Server shut down");
}
