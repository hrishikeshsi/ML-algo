import { PasswordResetToken } from '@prisma/client';
import { prisma } from '../database/prisma';

export const passwordResetRepository = {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markUsed(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  invalidateAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
