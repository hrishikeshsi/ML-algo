export interface ConversationPublic {
  id: string;
  userId: string;
  conversationIdFromAgent: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  title?: string;
}
