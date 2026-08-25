import type { Request } from "express";

const isProd = process.env.IS_PROD === "true";

export function getClientIp(req: Request) {
  if (!isProd && process.env.DEV_TEST_IP) {
    return process.env.DEV_TEST_IP;
  }

  const ip = req.ip?.trim();
  if (ip) return ip;

  const remoteAddress = req.socket.remoteAddress?.trim();
  if (remoteAddress) return remoteAddress;

  return null;
}
