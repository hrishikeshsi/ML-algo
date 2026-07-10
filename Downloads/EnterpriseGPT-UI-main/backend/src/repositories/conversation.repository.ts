import { Conversation, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';

export const conversationRepository = {
  create(data: Prisma.ConversationCreateInput): Promise<Conversation> {
    return prisma.conversation.create({ data });
  },

  findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({ where: { id } });
  },

  findByIdForUser(id: string, userId: string): Promise<Conversation | null> {
    return prisma.conversation.findFirst({ where: { id, userId } });
  },

  listForUser(userId: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  },

  setAgentConversationId(id: string, conversationIdFromAgent: string): Promise<Conversation> {
    return prisma.conversation.update({ where: { id }, data: { conversationIdFromAgent } });
  },

  touch(id: string): Promise<Conversation> {
    return prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
  },

  delete(id: string): Promise<Conversation> {
    return prisma.conversation.delete({ where: { id } });
  },

  count(): Promise<number> {
    return prisma.conversation.count();
  },
};
