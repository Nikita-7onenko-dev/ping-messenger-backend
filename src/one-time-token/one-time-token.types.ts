const TOKEN_TYPES = ["email_verification"] as const;

export type OneTimeTokenType = (typeof TOKEN_TYPES)[number];

export type OneTimeToken = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  tokenType: OneTimeTokenType;
};
