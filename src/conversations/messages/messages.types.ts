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

export type MessageCursor = {
  createdAt: Date;
  id: string;
};

export type Message = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
};
