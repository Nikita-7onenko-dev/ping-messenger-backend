export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
};

export type SessionMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
};

export type SessionRow = {
  id: string;
  lastOnlineAt: Date;
} & SessionMetadata;

export type Session = SessionRow & { isCurrent: boolean };
