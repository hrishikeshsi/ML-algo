import { Role } from '@prisma/client';

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}
