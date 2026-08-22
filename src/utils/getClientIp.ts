import type { Request } from "express";

export function getClientIp(req: Request) {
  const ip = req.ip?.trim();
  if (ip) return ip;

  const remoteAddress = req.socket.remoteAddress?.trim();
  if (remoteAddress) return remoteAddress;

  return null;
}
