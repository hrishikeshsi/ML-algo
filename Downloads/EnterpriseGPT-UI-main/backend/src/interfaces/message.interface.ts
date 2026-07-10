import { MessageSender } from '@prisma/client';

export interface MessagePublic {
  id: string;
  conversationId: string;
  sender: MessageSender;
  message: string;
  messageIdFromAgent: string | null;
  timestamp: Date;
}

export interface SendMessageInput {
  conversationId?: string;
  message: string;
}

export interface ChatResult {
  conversation: {
    id: string;
    title: string;
    conversationIdFromAgent: string | null;
  };
  userMessage: MessagePublic;
  agentMessage: MessagePublic;
}
