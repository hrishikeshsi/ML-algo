import { Conversation } from '@prisma/client';
import { conversationRepository } from '../repositories/conversation.repository';
import { purpleFabricService } from './purpleFabric.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { ConversationPublic, CreateConversationInput } from '../interfaces/conversation.interface';

function toConversationPublic(conversation: Conversation): ConversationPublic {
  return {
    id: conversation.id,
    userId: conversation.userId,
    conversationIdFromAgent: conversation.conversationIdFromAgent,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export const conversationService = {
  async listForUser(userId: string): Promise<ConversationPublic[]> {
    const conversations = await conversationRepository.listForUser(userId);
    return conversations.map(toConversationPublic);
  },

  async getForUser(id: string, userId: string): Promise<ConversationPublic> {
    const conversation = await conversationRepository.findByIdForUser(id, userId);
    if (!conversation) throw AppError.notFound('Conversation not found');
    return toConversationPublic(conversation);
  },

  async getEntityForUser(id: string, userId: string): Promise<Conversation> {
    const conversation = await conversationRepository.findByIdForUser(id, userId);
    if (!conversation) throw AppError.notFound('Conversation not found');
    return conversation;
  },

  async createForUser(userId: string, input: CreateConversationInput): Promise<ConversationPublic> {
    const title = input.title?.trim() || 'New Conversation';

    const conversation = await conversationRepository.create({
      title,
      user: { connect: { id: userId } },
    });

    try {
      const { conversationIdFromAgent } = await purpleFabricService.startConversation(title);
      const updated = await conversationRepository.setAgentConversationId(conversation.id, conversationIdFromAgent);
      return toConversationPublic(updated);
    } catch (error) {
      logger.error('Failed to start Purple Fabric conversation, keeping local-only conversation', {
        conversationId: conversation.id,
        error: error instanceof Error ? error.message : error,
      });
      return toConversationPublic(conversation);
    }
  },

  async deleteForUser(id: string, userId: string): Promise<void> {
    const conversation = await conversationRepository.findByIdForUser(id, userId);
    if (!conversation) throw AppError.notFound('Conversation not found');
    await conversationRepository.delete(id);
  },

  /** Ensures the given (already ownership-checked) conversation has a live agent-side thread. */
  async ensureAgentConversation(conversation: Conversation): Promise<Conversation> {
    if (conversation.conversationIdFromAgent) return conversation;

    const { conversationIdFromAgent } = await purpleFabricService.startConversation(conversation.title);
    return conversationRepository.setAgentConversationId(conversation.id, conversationIdFromAgent);
  },
};
