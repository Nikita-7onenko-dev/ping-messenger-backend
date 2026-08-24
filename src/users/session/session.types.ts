import type { Tokens } from "@/token/token.types.js";

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
};

export type Session = {
  id: string;
  lastOnlineAt: Date;
} & SessionMetadata;

export type SessionMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
};

export type CreateSessionResult = {
  session: Session;
  tokens: Tokens;
};
