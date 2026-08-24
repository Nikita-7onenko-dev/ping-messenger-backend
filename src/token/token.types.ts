export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};
