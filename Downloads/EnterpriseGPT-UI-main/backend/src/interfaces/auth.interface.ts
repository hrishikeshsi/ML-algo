import { Role } from '@prisma/client';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  organizationId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}
