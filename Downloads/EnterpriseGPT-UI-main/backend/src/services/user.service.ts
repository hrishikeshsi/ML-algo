import { User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';
import { hashPassword } from '../utils/password';
import { UpdateUserInput, UserPublic } from '../interfaces/user.interface';

function toUserPublic(user: User): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const userService = {
  async getById(userId: string): Promise<UserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return toUserPublic(user);
  },

  async update(userId: string, input: UpdateUserInput): Promise<UserPublic> {
    if (input.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw AppError.conflict('An account with this email already exists');
      }
    }

    const data: { name?: string; email?: string; passwordHash?: string } = {};
    if (input.name) data.name = input.name;
    if (input.email) data.email = input.email;
    if (input.password) data.passwordHash = await hashPassword(input.password);

    const updated = await userRepository.update(userId, data);
    return toUserPublic(updated);
  },

  async delete(userId: string): Promise<void> {
    await userRepository.delete(userId);
  },
};
