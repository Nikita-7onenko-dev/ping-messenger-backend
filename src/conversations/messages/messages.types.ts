export type PrivateMessagePayload = {
  participantId: string;
  content: string;
};

export type GroupMessagePayload = {
  conversationId: string;
  content: string;
};

export type CreateMessageInput = {
  conversationId: string;
  userId: string;
  content: string;
};

export type CreateMessagePayload = PrivateMessagePayload | GroupMessagePayload;

export type MessageRow = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  createdAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};
