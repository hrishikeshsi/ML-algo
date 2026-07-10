import { Message, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';

export const messageRepository = {
  create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  },

  listByConversation(conversationId: string): Promise<Message[]> {
    return prisma.message.findMany({ where: { conversationId }, orderBy: { timestamp: 'asc' } });
  },

  count(): Promise<number> {
    return prisma.message.count();
  },
};
