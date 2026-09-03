import type { Message } from "./messages/messages.types.js";
import type { Avatar, AvatarRow } from "@/users/avatar/avatar.types.js";

// DB projections
export type PrivateConversationRow = {
  id: string;
  participantId: string;
  participantName: string;
  messageId: string | null;
  senderId: string | null;
  content: string | null;
  createdAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  unreadCount: number;
} & AvatarRow;

// Domain/API models
export type PrivateConversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: Avatar;
  };
  lastMessage: Message | null;
  unreadCount: number;
};

export type Conversation = PrivateConversation;
