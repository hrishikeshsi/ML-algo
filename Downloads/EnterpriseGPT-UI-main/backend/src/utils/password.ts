import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env';

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, env.bcryptSaltRounds);
}

export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/** Generates a cryptographically secure raw token (e.g. for refresh/reset tokens). */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Hashes a raw token for storage so the plaintext token never touches the database. */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
