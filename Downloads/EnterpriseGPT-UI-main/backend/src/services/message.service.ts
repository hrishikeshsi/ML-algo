import { Message } from '@prisma/client';
import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { conversationService } from './conversation.service';
import { purpleFabricService } from './purpleFabric.service';
import { AppError } from '../utils/appError';
import { ChatResult, MessagePublic, SendMessageInput } from '../interfaces/message.interface';

function toMessagePublic(message: Message): MessagePublic {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: message.sender,
    message: message.message,
    messageIdFromAgent: message.messageIdFromAgent,
    timestamp: message.timestamp,
  };
}

export const messageService = {
  /**
   * Core chat flow: authenticate (done upstream by middleware) -> find or start a
   * conversation -> call the Purple Fabric agent -> persist both sides -> return the result.
   */
  async sendChatMessage(userId: string, input: SendMessageInput): Promise<ChatResult> {
    let conversation;

    if (input.conversationId) {
      conversation = await conversationRepository.findByIdForUser(input.conversationId, userId);
      if (!conversation) throw AppError.notFound('Conversation not found');
    } else {
      const created = await conversationService.createForUser(userId, {
        title: input.message.slice(0, 60),
      });
      conversation = await conversationRepository.findById(created.id);
      if (!conversation) throw AppError.internal('Failed to create conversation');
    }

    conversation = await conversationService.ensureAgentConversation(conversation);

    const userMessage = await messageRepository.create({
      sender: 'USER',
      message: input.message,
      conversation: { connect: { id: conversation.id } },
    });

    const agentResult = await purpleFabricService.continueConversation(
      conversation.conversationIdFromAgent as string,
      input.message
    );

    const agentMessage = await messageRepository.create({
      sender: 'AGENT',
      message: agentResult.responseText || 'The agent did not return a response.',
      messageIdFromAgent: agentResult.messageId ?? undefined,
      conversation: { connect: { id: conversation.id } },
    });

    await conversationRepository.touch(conversation.id);

    return {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        conversationIdFromAgent: conversation.conversationIdFromAgent,
      },
      userMessage: toMessagePublic(userMessage),
      agentMessage: toMessagePublic(agentMessage),
    };
  },

  async listForConversation(conversationId: string, userId: string): Promise<MessagePublic[]> {
    await conversationService.getForUser(conversationId, userId);
    const messages = await messageRepository.listByConversation(conversationId);
    return messages.map(toMessagePublic);
  },
};
