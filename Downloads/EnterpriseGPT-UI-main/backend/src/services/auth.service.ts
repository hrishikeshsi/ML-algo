import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { passwordResetRepository } from '../repositories/passwordReset.repository';
import { AppError } from '../utils/appError';
import { comparePassword, generateSecureToken, hashPassword, hashToken } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { parseDurationMs } from '../utils/duration';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { emailService } from './email.service';
import {
  AuthenticatedUser,
  AuthTokens,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../interfaces/auth.interface';

function toAuthenticatedUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthenticatedUser['role'];
  organizationId: string;
}): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
}

async function issueTokenPair(user: AuthenticatedUser): Promise<AuthTokens> {
  const tokenId = uuidv4();
  const refreshToken = signRefreshToken({ sub: user.id, tokenId });
  const expiresAt = new Date(Date.now() + parseDurationMs(env.jwt.refreshExpiresIn));

  await refreshTokenRepository.create(user.id, hashToken(refreshToken), expiresAt);

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });

  return { accessToken, refreshToken, expiresIn: env.jwt.expiresIn };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: AuthenticatedUser; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    let organizationId = input.organizationId;

    if (!organizationId) {
      const organization = await organizationRepository.create(input.organizationName as string);
      organizationId = organization.id;
    } else {
      const organization = await organizationRepository.findById(organizationId);
      if (!organization) {
        throw AppError.badRequest('organizationId does not reference an existing organization');
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      organization: { connect: { id: organizationId } },
    });

    const authenticatedUser = toAuthenticatedUser(user);
    const tokens = await issueTokenPair(authenticatedUser);

    logger.info('New user registered', { userId: user.id, organizationId });

    return { user: authenticatedUser, tokens };
  },

  async login(input: LoginInput): Promise<{ user: AuthenticatedUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const authenticatedUser = toAuthenticatedUser(user);
    const tokens = await issueTokenPair(authenticatedUser);

    return { user: authenticatedUser, tokens };
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const storedToken = await refreshTokenRepository.findValidByHash(tokenHash);
    if (!storedToken || storedToken.userId !== payload.sub) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    await refreshTokenRepository.revoke(storedToken.id);

    return issueTokenPair(toAuthenticatedUser(user));
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      return;
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await refreshTokenRepository.revoke(storedToken.id);
    }
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await userRepository.findByEmail(input.email);

    // Always behave the same way whether or not the account exists, to avoid leaking
    // which emails are registered.
    if (!user || !user.isActive) {
      logger.info('Password reset requested for unknown or inactive email', { email: input.email });
      return;
    }

    const rawToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + env.passwordReset.tokenTtlMinutes * 60 * 1000);

    await passwordResetRepository.invalidateAllForUser(user.id);
    await passwordResetRepository.create(user.id, hashToken(rawToken), expiresAt);

    const resetLink = `${env.passwordReset.resetUrl}?token=${rawToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink);
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const resetToken = await passwordResetRepository.findValidByHash(tokenHash);

    if (!resetToken) {
      throw AppError.badRequest('Invalid or expired password reset token');
    }

    const passwordHash = await hashPassword(input.newPassword);

    await userRepository.update(resetToken.userId, { passwordHash });
    await passwordResetRepository.markUsed(resetToken.id);
    await refreshTokenRepository.revokeAllForUser(resetToken.userId);

    logger.info('Password reset completed', { userId: resetToken.userId });
  },
};
