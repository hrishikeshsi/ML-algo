import { Prisma } from '@prisma/client';
import { apiLogRepository } from '../repositories/apiLog.repository';
import { userRepository } from '../repositories/user.repository';
import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { purpleFabricService } from './purpleFabric.service';
import { logger } from '../utils/logger';

export interface RecordApiLogInput {
  endpoint: string;
  method: string;
  request?: unknown;
  response?: unknown;
  statusCode: number;
  executionTime: number;
  userId?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  apiCallsLast24h: number;
  averageExecutionTimeMsLast24h: number | null;
  errorCountLast24h: number;
  purpleFabric: Awaited<ReturnType<typeof purpleFabricService.healthCheck>>;
}

const SENSITIVE_KEYS = new Set(['password', 'newpassword', 'token', 'refreshtoken', 'accesstoken']);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : redact(val);
    }
    return result;
  }

  return value;
}

export const logService = {
  /** Fire-and-forget audit log write — logging must never fail the originating request. */
  async recordApiLog(input: RecordApiLogInput): Promise<void> {
    try {
      await apiLogRepository.create({
        endpoint: input.endpoint,
        method: input.method,
        ...(input.request !== undefined ? { request: redact(input.request) as Prisma.InputJsonValue } : {}),
        ...(input.response !== undefined ? { response: redact(input.response) as Prisma.InputJsonValue } : {}),
        statusCode: input.statusCode,
        executionTime: input.executionTime,
        ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
      });
    } catch (error) {
      logger.error('Failed to persist API log entry', { error: error instanceof Error ? error.message : error });
    }
  },

  async listLogs(page: number, limit: number) {
    return apiLogRepository.list({ page, limit });
  },

  async getStats(): Promise<SystemStats> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, totalConversations, totalMessages, apiCallsLast24h, averageExecutionTimeMsLast24h, errorCountLast24h, purpleFabric] =
      await Promise.all([
        userRepository.count(),
        conversationRepository.count(),
        messageRepository.count(),
        apiLogRepository.countSince(since),
        apiLogRepository.averageExecutionTimeSince(since),
        apiLogRepository.countErrorsSince(since),
        purpleFabricService.healthCheck(),
      ]);

    return {
      totalUsers,
      totalConversations,
      totalMessages,
      apiCallsLast24h,
      averageExecutionTimeMsLast24h,
      errorCountLast24h,
      purpleFabric,
    };
  },
};
