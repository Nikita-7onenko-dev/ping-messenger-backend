export type Message = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  createdAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};
